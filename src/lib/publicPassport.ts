import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { USERNAME_RE, toPassport, type LinkRow, type ProfileRow, type StampRow } from "@/components/create/model";
import type { Passport } from "@/lib/types";

export interface PublicPassport {
  passport: Passport;
  isOwner: boolean;
  isPublic: boolean;
}

/**
 * Loads a passport by handle for the public page.
 *
 * Privacy rules:
 *  - Database row-level security already hides private profiles from everyone except the owner.
 *  - On top of that, a passport that has not been issued yet is only visible to its owner.
 *  - Hidden stamps are never included, even when the owner is looking.
 * Cached per request so the page and its metadata share one set of queries.
 */
export const loadPublicPassport = cache(async (rawUsername: string): Promise<PublicPassport | null> => {
  const username = rawUsername.toLowerCase();
  if (!USERNAME_RE.test(username)) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row } = await supabase
    .from("profiles")
    .select("id, username, display_name, headline, location, bio, avatar_url, stack, is_public, passport_no, issued_at")
    .eq("username", username)
    .maybeSingle();
  if (!row) return null;

  const profile = { ...(row as Omit<ProfileRow, "github_login">), github_login: null } as ProfileRow;
  const isOwner = user?.id === profile.id;
  if (!profile.passport_no && !isOwner) return null;

  const [linksRes, stampsRes] = await Promise.all([
    supabase.from("links").select("id, label, url, position").eq("user_id", profile.id).order("position", { ascending: true }),
    supabase
      .from("stamps")
      .select("id, title, category, earned_on, proof_url, verified, source, is_public")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("earned_on", { ascending: false }),
  ]);

  const passport = toPassport(profile, (linksRes.data ?? []) as LinkRow[], (stampsRes.data ?? []) as StampRow[]);
  return { passport, isOwner, isPublic: profile.is_public };
});
