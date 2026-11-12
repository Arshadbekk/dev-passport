import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { OG_SIZE, avatarDataUri, brandCard, profileCard } from "@/lib/ogCards";

// The Edge runtime avoids the Node-only @vercel/og loader on Windows.
export const runtime = "edge";

export const alt = "Developer Passport";
export const size = OG_SIZE;
export const contentType = "image/png";
// This card depends on profile data; generate it when requested.
export const dynamic = "force-dynamic";

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export default async function Image({ params }: { params: { username: string } }) {
  const username = params.username.toLowerCase();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Social crawlers are not logged in, so read with the public anon key (row-level security applies)
  if (url && key && USERNAME_RE.test(username)) {
    try {
      const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: p } = await sb
        .from("profiles")
        .select("id, username, display_name, headline, location, avatar_url, stack, is_public, passport_no")
        .eq("username", username)
        .maybeSingle();

      if (p && p.is_public && p.passport_no) {
        const { data: stamps } = await sb.from("stamps").select("verified").eq("user_id", p.id).eq("is_public", true);
        const list = (stamps ?? []) as { verified: boolean }[];
        const avatar = await avatarDataUri(p.avatar_url);

        return new ImageResponse(
          profileCard({
            name: p.display_name,
            username: p.username,
            headline: p.headline,
            location: p.location,
            stack: p.stack ?? [],
            passportNo: p.passport_no,
            stamps: list.length,
            verified: list.filter((s) => s.verified).length,
            avatar,
          }),
          { ...size },
        );
      }
    } catch {
      /* fall through to the brand card */
    }
  }

  // Private, unissued or unknown: show the generic card and reveal nothing
  return new ImageResponse(brandCard(), { ...size });
}
