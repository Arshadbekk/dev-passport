import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { STACK_GROUPS } from "@/components/create/model";
import InkStamp from "@/components/assets/InkStamp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Explore passports · Dev Passport", description: "Discover developers who chose to list their passport." };

const PAGE_SIZE = 12;
const KNOWN_STACK = new Set(STACK_GROUPS.flatMap((g) => g.items));
const FEATURED_STACK = ["Flutter", "Kotlin", "Swift", "React Native", "Firebase", "TypeScript"];

type Props = { searchParams: { q?: string; stack?: string; page?: string } };

interface Row {
  id: string;
  username: string;
  display_name: string;
  headline: string;
  location: string;
  avatar_url: string | null;
  stack: string[];
}

/** Removes characters that have a special meaning in a PostgREST filter, so a search can't alter the query. */
function cleanQuery(raw: string | undefined): string {
  return (raw ?? "").replace(/[,()%*\\"':;]/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
}

function href(q: string, stack: string, page: number): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (stack) p.set("stack", stack);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/explore?${s}` : "/explore";
}

export default async function ExplorePage({ searchParams }: Props) {
  const q = cleanQuery(searchParams.q);
  const stack = KNOWN_STACK.has(searchParams.stack ?? "") ? (searchParams.stack as string) : "";
  const page = Math.min(Math.max(parseInt(searchParams.page ?? "1", 10) || 1, 1), 1000);

  let rows: Row[] = [];
  let total = 0;
  let counts = new Map<string, { all: number; verified: number }>();
  let unavailable = !isSupabaseConfigured;

  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("profiles")
        .select("id, username, display_name, headline, location, avatar_url, stack", { count: "exact" })
        .eq("is_public", true)
        .eq("listed", true)
        .not("passport_no", "is", null)
        .order("issued_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (q) query = query.or(`display_name.ilike.%${q}%,username.ilike.%${q}%,headline.ilike.%${q}%`);
      if (stack) query = query.contains("stack", [stack]);

      const res = await query;
      rows = (res.data ?? []) as Row[];
      total = res.count ?? rows.length;

      if (rows.length > 0) {
        const { data: stamps } = await supabase
          .from("stamps")
          .select("user_id, verified")
          .in("user_id", rows.map((r) => r.id))
          .eq("is_public", true);
        for (const s of (stamps ?? []) as { user_id: string; verified: boolean }[]) {
          const c = counts.get(s.user_id) ?? { all: 0, verified: 0 };
          c.all += 1;
          if (s.verified) c.verified += 1;
          counts.set(s.user_id, c);
        }
      }
    } catch {
      unavailable = true;
    }
  }

  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const chip = "rounded-full border px-3 py-1 text-sm transition";

  return (
    <div className="py-14 sm:py-20">
      <p className="eyebrow !text-gold/80">Explore</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Discover developers.</h1>
      <p className="mt-3 max-w-2xl text-soft">Passports from developers who chose to list themselves. Every stamp is labeled verified or self-reported.</p>

      <form action="/explore" method="get" role="search" className="mt-8 flex max-w-xl gap-3">
        <label htmlFor="q" className="sr-only">Search by name, handle or role</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by name, handle or role" maxLength={40}
          className="w-full rounded-xl border border-gold/20 bg-ink/70 px-4 py-3 text-sm text-cream placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30" />
        {stack && <input type="hidden" name="stack" value={stack} />}
        <button type="submit" className="btn-gold !py-2.5">Search</button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter by skill">
        <Link href={href(q, "", 1)} className={`${chip} ${!stack ? "border-gold bg-gold/[0.1] text-goldsoft" : "border-line text-soft hover:border-gold/50"}`}>All</Link>
        {FEATURED_STACK.map((s) => (
          <Link key={s} href={href(q, s, 1)} aria-current={stack === s ? "true" : undefined}
            className={`${chip} ${stack === s ? "border-gold bg-gold/[0.1] text-goldsoft" : "border-line text-soft hover:border-gold/50"}`}>{s}</Link>
        ))}
      </div>

      {unavailable ? (
        <p className="mt-12 rounded-2xl border border-gold/25 bg-gold/[0.05] p-6 text-sm text-goldsoft">The directory is unavailable right now. Please try again in a moment.</p>
      ) : rows.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="opacity-40"><InkStamp category="Career" verified={false} className="h-28 w-28" /></div>
          <p className="mt-4 font-serif text-2xl">{q || stack ? "No passports match" : "No passports listed yet"}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {q || stack ? "Try a different search or clear the filters." : "Be the first: issue your passport, then turn on “List me in Explore” in Settings."}
          </p>
          <Link href={q || stack ? "/explore" : "/create"} className="btn-gold mt-6">{q || stack ? "Clear filters" : "Create your passport"}</Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted" aria-live="polite">{total} {total === 1 ? "passport" : "passports"}</p>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => {
              const c = counts.get(r.id) ?? { all: 0, verified: 0 };
              const avatar = r.avatar_url && r.avatar_url.startsWith("https://") ? r.avatar_url : null;
              return (
                <li key={r.id}>
                  <Link href={`/u/${r.username}`} className="group block h-full rounded-2xl border border-gold/20 bg-panel/70 p-5 transition hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-gradient-to-br from-goldsoft via-gold to-golddeep p-[2px]">
                        <div className="flex h-16 w-14 items-center justify-center overflow-hidden rounded-[10px] bg-ink font-serif text-xl text-goldsoft">
                          {avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                          ) : (
                            (r.display_name || r.username).charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-xl leading-tight [overflow-wrap:anywhere]">{r.display_name || r.username}</p>
                        <p className="text-xs text-muted [overflow-wrap:anywhere]">@{r.username}</p>
                      </div>
                    </div>
                    {r.headline && <p className="mt-4 line-clamp-2 text-sm text-soft">{r.headline}</p>}
                    {r.location && <p className="mt-1 line-clamp-1 text-xs text-muted">{r.location}</p>}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {r.stack.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-full border border-gold/20 px-2.5 py-0.5 text-[11px] text-soft">{s}</span>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-muted">{c.all} stamps · <span className="text-goldsoft">{c.verified} verified</span></p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-between text-sm">
              {page > 1 ? <Link href={href(q, stack, page - 1)} className="btn-ghost !py-2" rel="prev">← Previous</Link> : <span />}
              <span className="text-muted">Page {page} of {pages}</span>
              {page < pages ? <Link href={href(q, stack, page + 1)} className="btn-ghost !py-2" rel="next">Next →</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
