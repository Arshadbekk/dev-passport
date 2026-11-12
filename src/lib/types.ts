export const CATEGORIES = ["Contribution", "Project", "Learning", "Community", "Career"] as const;
export type StampCategory = (typeof CATEGORIES)[number];

export interface Stamp {
  id: string;
  title: string;
  category: StampCategory;
  date: string; // YYYY-MM-DD
  proofUrl: string; // link to a PR, app store page, certificate, etc.
  /** Only ever true for stamps verified by the platform. Shared/imported data is always false. */
  verified: boolean;
  /** Set by the editor when the owner hides the stamp from the public passport. */
  hidden?: boolean;
}

export interface LinkItem {
  label: string;
  url: string;
}

export interface Passport {
  name: string;
  username: string;
  headline: string;
  location: string;
  bio: string;
  stack: string[];
  links: LinkItem[];
  stamps: Stamp[];
  /** Server-generated (DP-YYYY-NNNNNN). Never read from shared links. */
  passportNo?: string;
  issuedAt?: string;
  avatarUrl?: string;
}

export const emptyPassport: Passport = {
  name: "",
  username: "",
  headline: "",
  location: "",
  bio: "",
  stack: [],
  links: [],
  stamps: [],
};
