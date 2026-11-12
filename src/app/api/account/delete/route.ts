import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { tooSoon } from "@/lib/throttle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/**
 * Permanently deletes the signed-in user's account.
 * Deleting the auth user cascades (database foreign keys) to their profile, links and stamps.
 * The user must type their handle to confirm, and the check happens on the server.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return fail(503, "Account deletion is not set up on this server yet.");

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return fail(403, "Request blocked.");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(401, "Please sign in first.");
  if (tooSoon(`delete:${user.id}`, 15_000)) return fail(429, "Please wait a moment and try again.");

  let confirm = "";
  try {
    const body = (await request.json()) as { confirm?: unknown };
    confirm = typeof body.confirm === "string" ? body.confirm.trim().toLowerCase() : "";
  } catch {
    return fail(400, "Invalid request.");
  }

  const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile } = await admin.from("profiles").select("username").eq("id", user.id).maybeSingle();
  if (!profile || confirm !== String(profile.username).toLowerCase()) {
    return fail(400, "The handle you typed doesn't match. Nothing was deleted.");
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return fail(500, "Couldn't delete the account. Please try again or contact us.");

  // Clear the browser session cookies (local scope: the user no longer exists server-side)
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.json({ ok: true });
}
