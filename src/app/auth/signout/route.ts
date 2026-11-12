import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  // 303 turns the POST into a GET on the home page
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
