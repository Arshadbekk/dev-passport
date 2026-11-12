import { CATEGORIES, Passport, Stamp, StampCategory } from "./types";

/** Only http(s) URLs are allowed. Blocks javascript: and other unsafe schemes. */
export function safeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.slice(0, max) : "");

/**
 * Validates and cleans untrusted data (from the URL or localStorage).
 * Important: `verified` is ALWAYS reset to false. Verification must come from a trusted backend, never from shared data.
 */
export function sanitizePassport(input: unknown): Passport | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;

  const stack = Array.isArray(o.stack)
    ? o.stack.map((s) => str(s, 30).trim()).filter(Boolean).slice(0, 20)
    : [];

  const links = Array.isArray(o.links)
    ? o.links
        .map((l) => {
          const r = (l ?? {}) as Record<string, unknown>;
          return { label: str(r.label, 30), url: safeUrl(r.url) };
        })
        .filter((l) => l.label && l.url)
        .slice(0, 8)
    : [];

  const stamps: Stamp[] = Array.isArray(o.stamps)
    ? o.stamps
        .map((s, i) => {
          const r = (s ?? {}) as Record<string, unknown>;
          const category = CATEGORIES.includes(r.category as StampCategory)
            ? (r.category as StampCategory)
            : "Project";
          return {
            id: str(r.id, 40) || `stamp-${i}`,
            title: str(r.title, 120),
            category,
            date: str(r.date, 10),
            proofUrl: safeUrl(r.proofUrl),
            verified: false,
          };
        })
        .filter((s) => s.title)
        .slice(0, 50)
    : [];

  return {
    name: str(o.name, 80),
    username: str(o.username, 40),
    headline: str(o.headline, 120),
    location: str(o.location, 80),
    bio: str(o.bio, 600),
    stack,
    links,
    stamps,
  };
}

export function encodePassport(p: Passport): string {
  const bytes = new TextEncoder().encode(JSON.stringify(p));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePassport(token: string): Passport | null {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return sanitizePassport(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}
