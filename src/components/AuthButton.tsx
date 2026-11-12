"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Nav link that switches between "Sign in" and "Dashboard". Client-side so pages stay static. */
export default function AuthButton() {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState("out");
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setState(data.user ? "in" : "out"));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setState(session ? "in" : "out"));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === "loading") return <span className="w-16" aria-hidden />;

  return state === "in" ? (
    <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
  ) : (
    <Link href="/login" className="transition hover:text-white">Sign in</Link>
  );
}
