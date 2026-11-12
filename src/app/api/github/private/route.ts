import { NextResponse } from "next/server";
import { fail, githubContext } from "@/lib/githubAuth";
import { ImportError } from "@/lib/githubImport";
import { fetchPrivateContributions, privateStamp } from "@/lib/githubProjects";
import { tooSoon } from "@/lib/throttle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Adds a verified stamp with the NUMBER of contributions GitHub reports for the user's private repositories.
 * No repository names, code or commit messages are read. Needs the user to have turned on
 * "Private contributions" in their GitHub profile settings.
 */
export async function POST(request: Request) {
  const res = await githubContext(request, { needsAdmin: true });
  if ("error" in res) return res.error;
  const { userId, login, token, admin } = res.ctx;
  if (tooSoon(`private:${userId}`, 10_000)) return fail(429, "Please wait a few seconds and try again.");

  try {
    const count = await fetchPrivateContributions(login, { token });
    const stamp = privateStamp(count, login);
    if (!stamp) {
      return NextResponse.json({
        created: 0,
        updated: 0,
        message:
          "GitHub reports no private contributions for your account. On your GitHub profile, open “Contribution settings” above the activity graph and tick “Private contributions”. Also make sure the email you commit with is added to your GitHub account. Then try again.",
      });
    }

    const db = admin();
    const { data: existing } = await db
      .from("stamps")
      .select("id")
      .eq("user_id", userId)
      .eq("external_id", stamp.external_id)
      .maybeSingle();

    const { error } = await db.from("stamps").upsert(
      {
        user_id: userId,
        title: stamp.title,
        category: stamp.category,
        earned_on: stamp.earned_on,
        proof_url: stamp.proof_url,
        verified: true,
        source: "github",
        external_id: stamp.external_id,
      },
      { onConflict: "user_id,external_id" },
    );
    if (error) return fail(500, "Couldn't save the stamp.");

    return NextResponse.json({
      created: existing ? 0 : 1,
      updated: existing ? 1 : 0,
      message: `${existing ? "Updated" : "Added"} a verified stamp: ${stamp.count} private contribution${stamp.count === 1 ? "" : "s"} in the last 12 months. Only the number is shown, never your repositories.`,
    });
  } catch (e) {
    return e instanceof ImportError ? fail(e.status, e.message) : fail(500, "Something went wrong. Please try again.");
  }
}
