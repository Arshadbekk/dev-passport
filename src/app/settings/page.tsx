import { redirect } from "next/navigation";
import SettingsPanel from "@/components/settings/SettingsPanel";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings · Dev Passport", robots: { index: false, follow: false } };

export default async function SettingsPage() {
  if (!isSupabaseConfigured) redirect("/login?next=/settings");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_public, listed, passport_no")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return <p className="py-24 text-center text-soft">Your profile is still being created. Refresh in a moment.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl py-14 sm:py-20">
      <p className="eyebrow !text-gold/80">Account</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Settings</h1>
      <p className="mt-3 text-soft">Control who can see your passport, and manage your data.</p>
      <SettingsPanel
        userId={user.id}
        username={profile.username as string}
        email={user.email ?? null}
        initial={{ isPublic: Boolean(profile.is_public), listed: Boolean(profile.listed), issued: Boolean(profile.passport_no) }}
      />
    </div>
  );
}
