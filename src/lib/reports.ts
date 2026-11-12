export const REPORT_REASONS = [
  { value: "impersonation", label: "Impersonation (pretending to be someone else)" },
  { value: "false_claims", label: "False or misleading claims" },
  { value: "inappropriate", label: "Inappropriate or offensive content" },
  { value: "spam", label: "Spam or scam" },
  { value: "privacy", label: "Shares someone's private information" },
  { value: "other", label: "Something else" },
] as const;
