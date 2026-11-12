import { NextResponse } from "next/server";
import { fail, githubContext } from "@/lib/githubAuth";
import { ImportError } from "@/lib/githubImport";
import { MAX_OWN_STAMPS, MAX_PICK, fetchRepo, isFullName, listOwnRepos, verifiedRepoStamp, type ProjectStamp } from "@/lib/githubProjects";
import { tooSoon } from "@/lib/throttle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lists the signed-in user's own public, non-fork repositories so they can pick which to add. */
export async function GET(request: Request) {
  const res = await githubContext(request, { needsAdmin: false });
  if ("error" in res) return res.error;
  const { userId, login, token, supabase } = res.ctx;
  if (tooSoon(`own-list:${userId}`, 3000)) return fail(429, "Please wait a moment and try again.");

  try {
    const repos = await listOwnRepos(login, { token });
    const { data } = await supabase.from("stamps").select("external_id").eq("user_id", userId).like("external_id", "github:own:%");
    const known = new Set((data ?? []).map((r: { external_id: string | null }) => r.external_id));

    return NextResponse.json({
      repos: repos.map((r) => ({
        full_name: r.full_name,
        name: r.name,
        description: r.description ? r.description.slice(0, 160) : null,
        language: r.language,
        stars: r.stargazers_count,
        pushed_at: r.pushed_at,
        added: known.has(`github:own:${r.full_name.toLowerCase()}`),
      })),
    });
  } catch (e) {
    return e instanceof ImportError ? fail(e.status, e.message) : fail(500, "Something went wrong. Please try again.");
  }
}

/** Verifies the chosen repositories on the server and creates verified "Project" stamps. */
export async function POST(request: Request) {
  const res = await githubContext(request, { needsAdmin: true });
  if ("error" in res) return res.error;
  const { userId, login, token, admin } = res.ctx;
  if (tooSoon(`own-add:${userId}`, 10_000)) return fail(429, "Please wait a few seconds and try again.");

  let body: { repos?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }
  const requested = Array.isArray(body.repos) ? [...new Set(body.repos.filter((v): v is string => typeof v === "string"))] : [];
  if (requested.length === 0 || requested.length > MAX_PICK) return fail(400, `Choose between 1 and ${MAX_PICK} repositories.`);
  // Cheap checks first, before any GitHub call: valid name, and it must be under the caller's own account
  for (const name of requested) {
    if (!isFullName(name) || name.split("/")[0].toLowerCase() !== login.toLowerCase()) {
      return fail(400, "You can only add repositories owned by your own GitHub account.");
    }
  }

  const db = admin();
  const { data: existing } = await db.from("stamps").select("external_id").eq("user_id", userId).like("external_id", "github:own:%");
  const known = new Set((existing ?? []).map((r: { external_id: string | null }) => r.external_id));

  const stamps: ProjectStamp[] = [];
  const skipped: string[] = [];
  try {
    for (const name of requested) {
      try {
        // Re-checked with GitHub on the server: public, not a fork, owned by this exact account
        stamps.push(verifiedRepoStamp(await fetchRepo(name, { token }), login));
      } catch (e) {
        if (e instanceof ImportError && e.status === 429) throw e;
        skipped.push(e instanceof ImportError ? e.message : `${name} could not be verified.`);
      }
    }
  } catch (e) {
    return e instanceof ImportError ? fail(e.status, e.message) : fail(500, "Something went wrong. Please try again.");
  }

  if (stamps.length === 0) return fail(422, skipped[0] ?? "None of those repositories could be verified.");

  const created = stamps.filter((s) => !known.has(s.external_id)).length;
  if (known.size + created > MAX_OWN_STAMPS) return fail(422, `You can have at most ${MAX_OWN_STAMPS} verified project stamps. Delete some first.`);

  const rows = stamps.map((s) => ({
    user_id: userId,
    title: s.title,
    category: s.category,
    earned_on: s.earned_on,
    proof_url: s.proof_url,
    verified: true,
    source: "github",
    external_id: s.external_id,
  }));
  const { error } = await db.from("stamps").upsert(rows, { onConflict: "user_id,external_id" });
  if (error) return fail(500, "Couldn't save the stamps.");

  const updated = stamps.length - created;
  return NextResponse.json({
    created,
    updated,
    skipped,
    message: `Added ${created} verified project${created === 1 ? "" : "s"}${updated ? ` (${updated} updated)` : ""}.${skipped.length ? ` ${skipped.length} skipped.` : ""}`,
  });
}
