import type { Passport } from "@/lib/types";
import { safeUrl } from "@/lib/share";
import { fmtDate } from "@/lib/format";
import Crest from "./assets/Crest";
import Rosette from "./assets/Rosette";
import Seal from "./assets/Seal";
import VisaStamp from "./VisaStamp";

function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
}

const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Machine-readable zone, like the two lines at the bottom of a real passport. */
function mrz(p: Passport): [string, string] {
  const parts = p.name.trim().split(/\s+/).filter(Boolean);
  const surname = norm(parts.length ? parts[parts.length - 1] : "");
  const given = parts.slice(0, -1).map(norm).filter(Boolean).join("<");
  const pad = (s: string) => s.padEnd(44, "<").slice(0, 44);
  const no = p.passportNo ? norm(p.passportNo) : "UNISSUED";
  return [pad(`P<DEV${surname}<<${given}`), pad(`${no}<DEV<${norm(p.username) || "DEVPASSPORT"}`)];
}

function Datum({ label, value, mono = false, dim = false }: { label: string; value: string; mono?: boolean; dim?: boolean }) {
  if (!value) return null;
  // Longer text gets a slightly smaller size, and wraps instead of being cut off
  const size = mono
    ? "font-mono text-sm tracking-wider"
    : value.length > 36
      ? "font-serif text-sm"
      : value.length > 22
        ? "font-serif text-base"
        : "font-serif text-lg";
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.25em] text-gold/70">{label}</p>
      <p title={value} className={`mt-0.5 leading-snug [overflow-wrap:anywhere] ${size} ${dim ? "text-muted" : "text-cream"}`}>
        {value}
      </p>
    </div>
  );
}

export default function PassportCard({
  passport: p,
  compact = false,
  snapshot = false,
}: {
  passport: Passport;
  compact?: boolean;
  /** True for passports decoded from a shared link: the passport number is deliberately not carried over. */
  snapshot?: boolean;
}) {
  const sorted = [...p.stamps].sort((a, b) => b.date.localeCompare(a.date));
  const verifiedCount = p.stamps.filter((s) => s.verified).length;
  const [m1, m2] = mrz(p);
  const avatar = p.avatarUrl && p.avatarUrl.startsWith("https://") ? safeUrl(p.avatarUrl) : "";
  const pad = compact ? "p-5" : "p-6 sm:p-10";

  return (
    <article className={`relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#2B0E18] to-[#15060C] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ${pad}`}>
      <Rosette className="pointer-events-none absolute -right-28 -top-28 h-[460px] w-[460px] text-gold opacity-[0.07]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 pb-4">
          <div className="flex items-center gap-3">
            <Crest className="h-11 w-11" simple />
            <div>
              <p className="eyebrow !text-gold/80">Developer Passport</p>
              <p className="text-xs text-muted">Mobile Dev Connect</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            {p.passportNo ? (
              <>
                <Seal className="h-8 w-8" />
                <span className="hidden text-[10px] uppercase tracking-[0.25em] text-goldsoft sm:inline">Issued</span>
              </>
            ) : (
              <span className="rounded-full border border-dashed border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold/70">
                {snapshot ? "Shared copy" : "Unissued"}
              </span>
            )}
          </div>
        </div>

        {/* Data page */}
        <div className={`mt-6 flex items-start ${compact ? "gap-4" : "gap-6"}`}>
          <div className="shrink-0 rounded-xl bg-gradient-to-br from-goldsoft via-gold to-golddeep p-[2px]">
            <div className={`relative overflow-hidden rounded-[10px] bg-ink ${compact ? "h-28 w-24" : "h-32 w-28 sm:h-40 sm:w-32"}`}>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-4xl text-goldsoft">{initials(p.name)}</div>
              )}
              {/* Holographic laminate */}
              <span aria-hidden className="holo pointer-events-none absolute inset-0" />
            </div>
          </div>

          <div className={`grid min-w-0 flex-1 gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
            <div className="sm:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold/70">Name</p>
              <h1 className={`mt-0.5 break-words font-serif leading-tight ${compact
                  ? p.name.length > 26 ? "text-xl" : "text-2xl"
                  : p.name.length > 26 ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
                }`}>
                {p.name || "Your name"}
              </h1>            </div>
            <Datum label="Role" value={p.headline} />
            <Datum label="Handle" value={p.username ? `@${p.username}` : ""} />
            <Datum label="Base" value={p.location} />
          </div>
        </div>

        {/* Passport number strip */}
        <div className={`mt-6 grid gap-4 border-y border-gold/15 py-4 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
          <Datum label="Passport No." value={p.passportNo ?? (snapshot ? "Shared copy" : "Not yet issued")} mono dim={!p.passportNo} />
          <Datum label="Date of issue" value={p.issuedAt ? fmtDate(p.issuedAt.slice(0, 10)) : "—"} dim={!p.issuedAt} />
          <Datum label="Stamps" value={`${p.stamps.length} · ${verifiedCount} verified`} />
        </div>

        {p.bio && <p className="mt-6 max-w-2xl leading-relaxed text-soft">{p.bio}</p>}

        {p.stack.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <span key={s} className="rounded-full border border-gold/25 px-3 py-1 text-xs text-soft">{s}</span>
            ))}
          </div>
        )}

        {p.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {p.links.map((l) => (
              <a
                key={l.url}
                href={safeUrl(l.url)}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-goldsoft underline decoration-gold/40 underline-offset-4 transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}

        {/* Visa pages */}
        <div className="mt-10 flex items-baseline justify-between border-t border-gold/20 pt-6">
          <h2 className="eyebrow !text-gold/80">Visa pages</h2>
          <span className="text-xs text-muted">
            {p.stamps.length} {p.stamps.length === 1 ? "stamp" : "stamps"}
          </span>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-gold/25 p-8 text-center text-sm text-muted">
            No stamps yet. Every achievement you add is pressed onto these pages.
          </p>
        ) : (
          <ul className={`mt-6 grid gap-x-4 gap-y-8 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            {sorted.map((s, i) => (
              <VisaStamp key={s.id} stamp={s} index={i} compact={compact} />
            ))}
          </ul>
        )}

        {/* Machine-readable zone */}
        <div className="mt-10 overflow-hidden border-t border-dashed border-gold/20 pt-4 font-mono text-[9px] leading-relaxed tracking-[0.14em] text-gold/45 sm:text-xs sm:tracking-[0.18em]">
          <p className="whitespace-nowrap">{m1}</p>
          <p className="whitespace-nowrap">{m2}</p>
        </div>
      </div>
    </article>
  );
}
