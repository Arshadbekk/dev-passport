import { Passport } from "./types";

export const samplePassport: Passport = {
  name: "Aisha Khan",
  username: "aishakhan",
  headline: "Flutter Developer · Open-source contributor",
  location: "Muscat, Oman",
  passportNo: "DP-2026-100000",
  issuedAt: "2026-01-10T09:00:00Z",
  bio: "Mobile developer focused on clean architecture and performance. I enjoy shipping small, reliable apps and mentoring new contributors.",
  stack: ["Flutter", "Dart", "Kotlin", "Firebase", "Bloc", "CI/CD"],
  links: [
    { label: "GitHub", url: "https://github.com/example" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/example" },
  ],
  stamps: [
    { id: "s1", title: "Joined Mobile Dev Connect", category: "Community", date: "2026-01-10", proofUrl: "https://www.linkedin.com/groups/40609412/", verified: true },
    { id: "s2", title: "Merged PR: offline caching for notes app", category: "Contribution", date: "2026-03-02", proofUrl: "https://github.com/example/repo/pull/42", verified: true },
    { id: "s3", title: "Published Habit Tracker on Google Play", category: "Project", date: "2026-04-18", proofUrl: "https://play.google.com/store", verified: false },
    { id: "s4", title: "Reviewed 20+ pull requests", category: "Community", date: "2026-06-01", proofUrl: "https://github.com/example", verified: true },
    { id: "s5", title: "Completed Advanced Flutter Animations course", category: "Learning", date: "2026-07-12", proofUrl: "https://example.com/certificate", verified: false },
    { id: "s6", title: "Mock interview: Senior Mobile Engineer", category: "Career", date: "2026-08-20", proofUrl: "https://example.com/feedback", verified: false },
  ],
};
