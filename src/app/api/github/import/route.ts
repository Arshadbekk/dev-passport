import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ImportError, fetchMergedPulls, groupPulls, resolveLogin } from "@/lib/githubImport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOLDOWN_MS = 10 * 60 * 1000;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
const asString = (v: unknown): string | null => (typeof v === "string" || typeof v === "number" ? String(v) : null);

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return fail(503, "The GitHub importer is not set up on this server yet.");

  // Basic CSRF protection: browsers always send Origin on POST
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return fail(403, "Request blocked.");

  // 1. Who is asking? (validated with Supabase, not trusted from the browser)
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "Please sign in first.");

  const github = user.identities?.find((i) => i.provider === "github");
  if (!github) return fail(400, "Sign in with GitHub to import contributions.");
  const idData = (github.identity_data ?? {}) as Record<string, unknown>;
  const providerId = asString(idData.provider_id) ?? asString(idData.sub);
  const storedLogin = asString(idData.user_name) ?? asString(idData.preferred_username);

  // 2. Service-role client: the ONLY place that can create verified stamps
  const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: profile } = await admin.from("profiles").select("github_synced_at").eq("id", user.id).single();
  if (!profile) return fail(404, "Profile not found.");

  const previousSync: string | null = profile.github_synced_at ?? null;
  if (previousSync) {
    const wait = COOLDOWN_MS - (Date.now() - Date.parse(previousSync));
    if (wait > 0) return fail(429, `You synced recently. Try again in ${Math.ceil(wait / 60000)} minute(s).`);
  }

  // Claim the cooldown first so rapid repeat clicks cannot hammer GitHub
  await admin.from("profiles").update({ github_synced_at: new Date().toISOString() }).eq("id", user.id);

  try {
    const token = process.env.GITHUB_TOKEN || undefined;
    const login = await resolveLogin(providerId, storedLogin, { token });
    const items = await fetchMergedPulls(login, { token });
    const stamps = groupPulls(items, login);

    if (stamps.length === 0) {
      return NextResponse.json({
        created: 0,
        updated: 0,
        message: "No merged pull requests found in other people's public repositories yet. Once you have some, sync again.",
      });
    }

    const { data: existing } = await admin
      .from("stamps")
      .select("external_id")
      .eq("user_id", user.id)
      .eq("source", "github");
    const known = new Set((existing ?? []).map((r: { external_id: string | null }) => r.external_id));

    // Only these columns are written, so a user's own is_public choice is preserved on re-sync
    const rows = stamps.map((s) => ({
      user_id: user.id,
      title: s.title,
      category: s.category,
      earned_on: s.earned_on,
      proof_url: s.proof_url,
      verified: true,
      source: "github",
      external_id: s.external_id,
    }));

    const { error } = await admin.from("stamps").upsert(rows, { onConflict: "user_id,external_id" });
    if (error) throw new ImportError(500, "Couldn't save the imported stamps.");

    await admin.from("profiles").update({ github_login: login }).eq("id", user.id);

    const created = stamps.filter((s) => !known.has(s.external_id)).length;
    const updated = stamps.length - created;
    const pulls = stamps.reduce((n, s) => n + s.pulls, 0);
    return NextResponse.json({
      created,
      updated,
      message: `Imported ${stamps.length} ${stamps.length === 1 ? "repository" : "repositories"} (${pulls} merged pull requests). ${created} new, ${updated} updated.`,
    });
  } catch (e) {
    // Give the cooldown back if nothing was imported
    await admin.from("profiles").update({ github_synced_at: previousSync }).eq("id", user.id);
    if (e instanceof ImportError) return fail(e.status, e.message);
    return fail(500, "Something went wrong while importing. Please try again.");
  }
}
