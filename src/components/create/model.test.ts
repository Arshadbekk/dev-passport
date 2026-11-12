import { describe, expect, it } from "vitest";
import { USERNAME_RE, computeStrength, detectPlatform, normalizeUrl, toPassport, type LinkRow, type ProfileRow, type StampRow } from "./model";

const profile: ProfileRow = {
  id: "1", username: "aisha", display_name: "Aisha Khan", headline: "Flutter Developer", location: "Muscat", bio: "x".repeat(50),
  avatar_url: "https://avatars.githubusercontent.com/u/1", github_login: "aisha", stack: ["Flutter", "Dart", "Firebase"], is_public: true,
  passport_no: null, issued_at: null,
};
const links: LinkRow[] = [
  { id: "l1", label: "GitHub", url: "https://github.com/a", position: 1 },
  { id: "l2", label: "LinkedIn", url: "https://linkedin.com/in/a", position: 0 },
];
const stamps: StampRow[] = [1, 2, 3].map((i) => ({
  id: `s${i}`, title: `t${i}`, category: "Project", earned_on: `2026-01-0${i}`, proof_url: `https://x.com/${i}`, verified: false, source: "manual", is_public: i !== 3,
}));

describe("normalizeUrl", () => {
  it("adds https and keeps valid http(s)", () => {
    expect(normalizeUrl("github.com/aisha")).toBe("https://github.com/aisha");
    expect(normalizeUrl("http://a.com/x")).toBe("http://a.com/x");
  });
  it("rejects unsafe schemes and junk", () => {
    for (const bad of ["javascript:alert(1)", "ftp://x.com", "mailto:a@b.com", "tel:123", "file:///etc/passwd", "   ", ""]) {
      expect(normalizeUrl(bad)).toBeNull();
    }
  });
  it("rejects very long URLs", () => {
    expect(normalizeUrl(`a.com/${"x".repeat(600)}`)).toBeNull();
  });
});

describe("detectPlatform", () => {
  it("recognises common platforms", () => {
    expect(detectPlatform("https://github.com/a")).toBe("github");
    expect(detectPlatform("https://www.linkedin.com/in/a")).toBe("linkedin");
    expect(detectPlatform("https://play.google.com/store/apps/details?id=x")).toBe("play");
    expect(detectPlatform("https://apps.apple.com/app/x")).toBe("appstore");
    expect(detectPlatform("https://aisha.dev")).toBe("web");
  });
});

describe("USERNAME_RE", () => {
  it("matches the database rule", () => {
    expect(USERNAME_RE.test("aisha")).toBe(true);
    expect(USERNAME_RE.test("a_b-9")).toBe(true);
    expect(USERNAME_RE.test("ab")).toBe(false);
    expect(USERNAME_RE.test("-abc")).toBe(false);
    expect(USERNAME_RE.test("Abc")).toBe(false);
    expect(USERNAME_RE.test("a".repeat(31))).toBe(false);
  });
});

describe("computeStrength", () => {
  it("scores a complete profile as 100", () => {
    const s = computeStrength(profile, links, stamps);
    expect(s.score).toBe(100);
    expect(s.tips).toHaveLength(0);
    expect(s.label).toBe("Outstanding");
  });
  it("scores an empty profile as 0 and gives tips", () => {
    const s = computeStrength({ ...profile, display_name: "", headline: "", bio: "", location: "", stack: [], avatar_url: null }, [], []);
    expect(s.score).toBe(0);
    expect(s.tips.length).toBeGreaterThan(0);
    expect(s.label).toBe("Getting started");
  });
});

describe("toPassport", () => {
  it("orders links by position", () => {
    expect(toPassport(profile, links, stamps).links.map((l) => l.label)).toEqual(["LinkedIn", "GitHub"]);
  });
  it("hides hidden stamps unless asked", () => {
    expect(toPassport(profile, links, stamps).stamps).toHaveLength(2);
    expect(toPassport(profile, links, stamps, { includeHidden: true }).stamps).toHaveLength(3);
  });
  it("carries the server-issued passport number", () => {
    expect(toPassport({ ...profile, passport_no: "DP-2026-100001" }, links, stamps).passportNo).toBe("DP-2026-100001");
  });
});
