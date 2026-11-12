import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface DashboardProfile {
  username: string;
  display_name: string;
  is_public: boolean;
  passport_no: string | null;
  issued_at: string | null;
}

function Stat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-gold/25 bg-panel p-5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-gold/70">{label}</p>
      <p className={`mt-1 break-words ${mono ? "font-mono text-lg tracking-wider" : "font-serif text-2xl"}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured) redirect("/login");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, is_public, passport_no, issued_at")
    .eq("id", user.id)
    .single<DashboardProfile>();

  const [{ count: total }, { count: verified }] = await Promise.all([
    supabase.from("stamps").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("stamps").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("verified", true),
  ]);

  const issued = Boolean(profile?.passport_no);

  return (
    <div className="py-16">
      <p className="eyebrow !text-gold/80">Dashboard</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
        Welcome{profile?.display_name ? `, ${profile.display_name.split(" ")[0]}` : ""}.
      </h1>

      {!profile ? (
        <p className="mt-6 text-soft">Your profile is still being created. Refresh in a moment.</p>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Handle" value={`@${profile.username}`} />
            <Stat label="Passport No." value={profile.passport_no ?? "Not issued yet"} mono={issued} />
            <Stat label="Stamps" value={`${total ?? 0} · ${verified ?? 0} verified`} />
            <Stat label="Visibility" value={profile.is_public ? "Public" : "Private"} />
          </div>

          {issued && profile.issued_at && (
            <p className="mt-4 text-sm text-muted">Issued {fmtDate(profile.issued_at.slice(0, 10))}.</p>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            {issued ? (
              <>
                <Link href={`/u/${profile.username}`} className="btn-gold">View my passport</Link>
                <Link href="/create" className="btn-ghost">Edit passport</Link>
              </>
            ) : (
              <Link href="/create" className="btn-gold">Issue my passport</Link>
            )}
            <Link href="/settings" className="btn-ghost">Settings</Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn-ghost">Sign out</button>
            </form>
          </div>

          {issued && profile.is_public && (
            <p className="mt-6 text-sm text-muted">
              Your permanent link: <span className="text-soft">/u/{profile.username}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
