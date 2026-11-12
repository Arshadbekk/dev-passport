import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

const STATIC = ["", "/demo", "/explore", "/roadmap", "/community", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return entries;

  try {
    // Only passports whose owners chose to be listed are advertised to search engines
    const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await sb
      .from("profiles")
      .select("username, updated_at")
      .eq("is_public", true)
      .eq("listed", true)
      .not("passport_no", "is", null)
      .order("issued_at", { ascending: false })
      .limit(1000);
    for (const p of (data ?? []) as { username: string; updated_at: string }[]) {
      entries.push({ url: `${SITE_URL}/u/${p.username}`, lastModified: p.updated_at, changeFrequency: "weekly", priority: 0.5 });
    }
  } catch {
    /* fall back to the static pages */
  }
  return entries;
}
