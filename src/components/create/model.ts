import type { Passport, StampCategory } from "@/lib/types";
import { safeUrl } from "@/lib/share";

/* ---------- Database rows (what the editor loads and saves) ---------- */
export interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  headline: string;
  location: string;
  bio: string;
  avatar_url: string | null;
  github_login: string | null;
  stack: string[];
  is_public: boolean;
  passport_no: string | null;
  issued_at: string | null;
}

export interface LinkRow {
  id: string;
  label: string;
  url: string;
  position: number;
}

export interface StampRow {
  id: string;
  title: string;
  category: StampCategory;
  earned_on: string;
  proof_url: string | null;
  verified: boolean;
  source: string;
  is_public: boolean;
}

/* ---------- Steps and limits (mirror the database constraints) ---------- */
export type StepId = "identity" | "stack" | "links" | "stamps" | "review";

export const STEPS: { id: StepId; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "stack", label: "Stack" },
  { id: "links", label: "Links" },
  { id: "stamps", label: "Stamps" },
  { id: "review", label: "Issue" },
];

export const LIMITS = { name: 80, headline: 120, location: 80, bio: 600, stack: 20, links: 8, stampTitle: 120, skill: 30 };
export const MAX_PICK_UI = 10;
export const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export const STACK_GROUPS: { name: string; items: string[] }[] = [
  { name: "Flutter", items: ["Flutter", "Dart", "Bloc", "Riverpod", "Provider", "GetX"] },
  { name: "Android", items: ["Kotlin", "Jetpack Compose", "Java", "Coroutines", "Room", "Hilt"] },
  { name: "iOS", items: ["Swift", "SwiftUI", "UIKit", "Combine", "Core Data", "Xcode"] },
  { name: "React Native", items: ["React Native", "TypeScript", "JavaScript", "Expo", "Redux", "React Query"] },
  { name: "Backend & cloud", items: ["Firebase", "Supabase", "Node.js", "REST APIs", "GraphQL", "PostgreSQL", "AWS"] },
  { name: "Tools", items: ["Git", "CI/CD", "GitHub Actions", "Fastlane", "Figma", "Unit testing"] },
];

/* ---------- Links ---------- */
export type Platform = "github" | "linkedin" | "play" | "appstore" | "x" | "web";

export const PLATFORM_META: Record<Platform, { label: string; badge: string }> = {
  github: { label: "GitHub", badge: "GH" },
  linkedin: { label: "LinkedIn", badge: "in" },
  play: { label: "Play Store", badge: "GP" },
  appstore: { label: "App Store", badge: "iOS" },
  x: { label: "X", badge: "X" },
  web: { label: "Website", badge: "www" },
};

export function detectPlatform(url: string): Platform {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "github.com") return "github";
    if (host.endsWith("linkedin.com")) return "linkedin";
    if (host === "play.google.com") return "play";
    if (host === "apps.apple.com") return "appstore";
    if (host === "x.com" || host === "twitter.com") return "x";
  } catch {
    /* fall through */
  }
  return "web";
}

/** Adds https:// when missing and only accepts http(s) URLs up to 500 characters. */
export function normalizeUrl(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  // Reject other schemes outright instead of wrapping them in https://
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t) && !/^https?:\/\//i.test(t)) return null;
  if (/^(javascript|data|vbscript|mailto|tel|ftp|file|blob):/i.test(t)) return null;
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  const safe = safeUrl(withScheme);
  return safe && safe.length <= 500 ? safe : null;
}

/* ---------- Passport for preview, sharing and the passport page ---------- */
export function toPassport(
  profile: ProfileRow,
  links: LinkRow[],
  stamps: StampRow[],
  opts: { includeHidden?: boolean } = {},
): Passport {
  return {
    name: profile.display_name,
    username: profile.username,
    headline: profile.headline,
    location: profile.location,
    bio: profile.bio,
    stack: profile.stack,
    links: [...links].sort((a, b) => a.position - b.position).map((l) => ({ label: l.label, url: l.url })),
    stamps: stamps
      .filter((s) => opts.includeHidden || s.is_public)
      .map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category,
        date: s.earned_on,
        proofUrl: s.proof_url ?? "",
        verified: s.verified,
        hidden: !s.is_public,
      })),
    passportNo: profile.passport_no ?? undefined,
    issuedAt: profile.issued_at ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
  };
}

/* ---------- Passport strength ---------- */
export interface Tip {
  text: string;
  step: StepId;
}

export function computeStrength(
  p: ProfileRow,
  links: LinkRow[],
  stamps: StampRow[],
): { score: number; label: string; tips: Tip[] } {
  const tips: Tip[] = [];
  let score = 0;
  const add = (ok: boolean, points: number, tip: Tip) => {
    if (ok) score += points;
    else tips.push(tip);
  };

  const withProof = stamps.filter((s) => s.proof_url).length;
  add(p.display_name.trim().length >= 2, 10, { text: "Add your full name", step: "identity" });
  add(p.headline.trim().length >= 5, 10, { text: "Add a headline, e.g. “Flutter Developer”", step: "identity" });
  add(p.location.trim().length > 0, 5, { text: "Add your location", step: "identity" });
  add(p.bio.trim().length >= 40, 10, { text: "Write a bio of at least 40 characters", step: "identity" });
  add(Boolean(p.avatar_url), 5, { text: "Add a portrait by signing in with GitHub", step: "identity" });
  add(p.stack.length >= 3, 15, { text: "Pick at least 3 skills", step: "stack" });
  add(links.length >= 2, 15, { text: "Add at least 2 links (GitHub, LinkedIn, portfolio)", step: "links" });
  add(stamps.length >= 3, 15, { text: "Add at least 3 stamps", step: "stamps" });
  add(withProof >= 3, 15, { text: "Give at least 3 stamps a proof link", step: "stamps" });

  const label = score < 40 ? "Getting started" : score < 70 ? "Taking shape" : score < 90 ? "Strong" : "Outstanding";
  return { score, label, tips };
}
