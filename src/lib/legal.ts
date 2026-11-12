/** Details shown on the Privacy and Terms pages. Set these in .env.local / Vercel; nothing here is a secret. */
export const LEGAL = {
  operator: process.env.NEXT_PUBLIC_OPERATOR_NAME || "the Dev Passport maintainers",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  /** Optional. Example: "Oman". When empty, the Terms simply do not name a governing law. */
  jurisdiction: process.env.NEXT_PUBLIC_JURISDICTION || "",
  updated: "11 November 2026",
} as const;
