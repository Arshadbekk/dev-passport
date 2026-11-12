import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { USERNAME_RE } from "@/components/create/model";
import { REPORT_REASONS } from "@/lib/reports";
import { tooSoon } from "@/lib/throttle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/** Receives an abuse report about a passport. Stored for the maintainers; never shown publicly. */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return fail(503, "Reporting is not set up on this server yet.");

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return fail(403, "Request blocked.");

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "Invalid request.");
  }

  // Honeypot: real people never fill this hidden field. Pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (tooSoon(`report:${ip}`, 20_000)) return fail(429, "Please wait a moment before sending another report.");

  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const reason = typeof body.reason === "string" ? body.reason : "";
  const details = typeof body.details === "string" ? body.details.trim().slice(0, 1000) : "";

  if (!USERNAME_RE.test(username)) return fail(400, "Enter the handle of the passport you are reporting.");
  if (!REPORT_REASONS.some((r) => r.value === reason)) return fail(400, "Choose a reason.");

  // Optional: attach the reporter if they happen to be signed in
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.from("reports").insert({ username, reason, details, reporter_id: user?.id ?? null });
  if (error) return fail(500, "Couldn't send the report. Please try again or email us.");

  return NextResponse.json({ ok: true });
}
