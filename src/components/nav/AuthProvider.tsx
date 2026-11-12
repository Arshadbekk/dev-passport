"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type NavUser = { name: string; login: string | null; avatarUrl: string | null };
type AuthValue = { status: "loading" | "in" | "out"; user: NavUser | null };

const AuthContext = createContext<AuthValue>({ status: "loading", user: null });
export const useAuth = () => useContext(AuthContext);

type SupabaseUserLike = { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined;

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function toNavUser(u: SupabaseUserLike): NavUser | null {
  if (!u) return null;
  const meta = u.user_metadata ?? {};
  const login = str(meta.user_name) ?? str(meta.preferred_username);
  const avatar = str(meta.avatar_url);
  return {
    name: str(meta.full_name) ?? str(meta.name) ?? login ?? u.email ?? "Your account",
    login,
    // Only ever render https images
    avatarUrl: avatar && avatar.startsWith("https://") ? avatar : null,
  };
}

/**
 * One Supabase subscription for the whole app (nav, mobile menu and command palette share it).
 * The initial state is "loading" on the server AND on the first client render, so there is no hydration mismatch.
 * This is a display hint only: real protection stays in the middleware and server components.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<AuthValue>({ status: "loading", user: null });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setValue({ status: "out", user: null });
      return;
    }
    const supabase = createClient();
    let active = true;
    const apply = (u: SupabaseUserLike) => {
      if (!active) return;
      const user = toNavUser(u);
      setValue(user ? { status: "in", user } : { status: "out", user: null });
    };
    // getSession reads the local cookie (no network round trip), which keeps the first paint quick
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const memo = useMemo(() => value, [value]);
  return <AuthContext.Provider value={memo}>{children}</AuthContext.Provider>;
}

/** Sign out through the existing POST route (it clears cookies server-side and redirects home). */
export function postSignOut() {
  const form = document.createElement("form");
  form.method = "post";
  form.action = "/auth/signout";
  document.body.appendChild(form);
  form.submit();
}
