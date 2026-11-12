export interface Profile {
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
}

export type ProfileSummary = Pick<Profile, "username" | "display_name" | "headline" | "is_public">;
