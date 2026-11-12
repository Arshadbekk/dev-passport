import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import CreateWizard from "@/components/create/CreateWizard";
import type { LinkRow, ProfileRow, StampRow } from "@/components/create/model";

export const dynamic = "force-dynamic";
export const metadata = { title: "Issue your passport · Dev Passport" };

export default async function CreatePage() {
  if (!isSupabaseConfigured) redirect("/login?next=/create");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/create");

  const [profileRes, linksRes, stampsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, headline, location, bio, avatar_url, github_login, stack, is_public, passport_no, issued_at")
      .eq("id", user.id)
      .single<ProfileRow>(),
    supabase.from("links").select("id, label, url, position").eq("user_id", user.id).order("position", { ascending: true }),
    supabase
      .from("stamps")
      .select("id, title, category, earned_on, proof_url, verified, source, is_public")
      .eq("user_id", user.id)
      .order("earned_on", { ascending: false }),
  ]);

  if (!profileRes.data) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="font-serif text-3xl">We couldn&apos;t load your profile</h1>
        <p className="mt-3 text-soft">
          {profileRes.error?.message?.includes("passport_no")
            ? "The database is missing the latest update. Run supabase/migrations/0002_passport_issue.sql in the Supabase SQL Editor, then refresh."
            : "Your profile may still be getting created. Refresh in a moment."}
        </p>
        {profileRes.error && <p className="mt-4 text-xs text-muted">{profileRes.error.message}</p>}
      </div>
    );
  }

  return (
    <CreateWizard
      initial={{
        profile: profileRes.data,
        links: (linksRes.data ?? []) as LinkRow[],
        stamps: (stampsRes.data ?? []) as StampRow[],
      }}
    />
  );
}
