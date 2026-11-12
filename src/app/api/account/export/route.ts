import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Downloads everything Dev Passport stores about the signed-in user, as JSON. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  // Row-level security guarantees these queries can only return the caller's own rows
  const [profile, links, stamps] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("links").select("*").eq("user_id", user.id).order("position", { ascending: true }),
    supabase.from("stamps").select("*").eq("user_id", user.id).order("earned_on", { ascending: false }),
  ]);

  const body = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email ?? null, created_at: user.created_at },
    profile: profile.data ?? null,
    links: links.data ?? [],
    stamps: stamps.data ?? [],
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="dev-passport-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
