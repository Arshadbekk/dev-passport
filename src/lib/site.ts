/**
 * Single source of truth for site-wide links and navigation.
 * Replace the placeholder URLs below, or set the NEXT_PUBLIC_* variables in .env.local.
 * (Each variable is written out in full so Next.js can inline it into client code.)
 */
export const LINKS = {
  github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/YOUR-ORG/dev-passport",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/groups/YOUR-GROUP-ID/",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://chat.whatsapp.com/YOUR-INVITE-CODE",
} as const;

/** True once the real repository URL has been supplied. */
export const githubConfigured = !LINKS.github.includes("YOUR-ORG");

export type ProductLink = {
  href: string;
  title: string;
  desc: string;
  art: "steps" | "stamp" | "seal";
};

export const PRODUCT_LINKS: ProductLink[] = [
  { href: "/#how-it-works", title: "How it works", desc: "From GitHub sign-in to a link you can share.", art: "steps" },
  { href: "/demo", title: "Stamps", desc: "Contributions, projects, learning, community and career.", art: "stamp" },
  { href: "/#trust", title: "Trust model", desc: "Only the platform can mark a stamp as verified.", art: "seal" },
];

export const MAIN_LINKS = [
  { href: "/demo", label: "Example" },
  { href: "/explore", label: "Explore" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/community", label: "Community" },
] as const;

/** Where the signed-in menu points. */
export const ACCOUNT_LINKS = {
  dashboard: "/dashboard",
  passport: "/create",
  settings: "/settings",
} as const;
