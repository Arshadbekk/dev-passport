import { describe, expect, it } from "vitest";
import { ImportError, buildQuery, fetchMergedPulls, groupPulls, isValidLogin, resolveLogin, type FetchLike, type SearchItem } from "./githubImport";

const pr = (repo: string, login: string, merged: string | null): SearchItem => ({
  repository_url: `https://api.github.com/repos/${repo}`,
  user: { login },
  pull_request: { merged_at: merged },
  closed_at: merged,
});

describe("groupPulls", () => {
  const items = [
    pr("flutter/flutter", "Aisha", "2026-03-02T10:00:00Z"),
    pr("flutter/flutter", "aisha", "2026-05-10T10:00:00Z"),
    pr("flutter/flutter", "someoneelse", "2026-06-10T10:00:00Z"),
    pr("aisha/my-own-repo", "aisha", "2026-06-11T10:00:00Z"),
    pr("square/okhttp", "aisha", null),
    pr("square/okhttp", "aisha", "2026-01-05T08:00:00Z"),
    { repository_url: "https://evil.example/repos/x/y", user: { login: "aisha" }, pull_request: { merged_at: "2026-01-01T00:00:00Z" } },
    pr("bad/date", "aisha", "not-a-date"),
  ];
  const stamps = groupPulls(items, "aisha");

  it("makes one stamp per repository, newest first", () => {
    expect(stamps.map((s) => s.external_id)).toEqual(["github:repo:flutter/flutter", "github:repo:square/okhttp"]);
  });
  it("counts only merged PRs authored by the user", () => {
    expect(stamps[0].title).toBe("Merged 2 pull requests in flutter/flutter");
    expect(stamps[1].title).toBe("Merged 1 pull request in square/okhttp");
  });
  it("ignores the user's own repositories", () => {
    expect(stamps.some((s) => s.external_id.includes("aisha/"))).toBe(false);
  });
  it("uses the latest merge date and a filtered proof link", () => {
    expect(stamps[0].earned_on).toBe("2026-05-10");
    expect(stamps[0].proof_url).toBe("https://github.com/flutter/flutter/pulls?q=is%3Apr%20is%3Amerged%20author%3Aaisha");
  });
  it("caps the result at 20 repositories", () => {
    const many = Array.from({ length: 30 }, (_, i) => pr(`org/r${i}`, "aisha", `2026-01-${String((i % 28) + 1).padStart(2, "0")}T00:00:00Z`));
    expect(groupPulls(many, "aisha")).toHaveLength(20);
  });
});

describe("buildQuery / isValidLogin", () => {
  it("builds the search query", () => {
    expect(buildQuery("aisha")).toBe("type:pr author:aisha is:merged is:public -user:aisha");
  });
  it("rejects logins that could alter the query", () => {
    expect(() => buildQuery("bad login; drop")).toThrow();
    expect([isValidLogin("a-b"), isValidLogin("-ab"), isValidLogin("a".repeat(40)), isValidLogin("a b")]).toEqual([true, false, false, false]);
  });
});

describe("fetchMergedPulls", () => {
  it("reads two pages when the first is full", async () => {
    let calls = 0;
    const page = (n: number) => ({ items: Array.from({ length: n }, () => pr("o/r", "aisha", "2026-02-02T00:00:00Z")) });
    const f: FetchLike = async () => {
      calls++;
      return { ok: true, status: 200, json: async () => page(calls === 1 ? 100 : 7) };
    };
    expect(await fetchMergedPulls("aisha", { fetchImpl: f })).toHaveLength(107);
    expect(calls).toBe(2);
  });
  it("turns rate limiting into a 429 error", async () => {
    const f: FetchLike = async () => ({ ok: false, status: 403, json: async () => ({}) });
    await expect(fetchMergedPulls("aisha", { fetchImpl: f })).rejects.toMatchObject({ status: 429 });
  });
  it("turns a network failure into a 502 error", async () => {
    const f: FetchLike = async () => {
      throw new Error("network");
    };
    await expect(fetchMergedPulls("aisha", { fetchImpl: f })).rejects.toMatchObject({ status: 502 });
  });
});

describe("resolveLogin", () => {
  it("follows a renamed account by GitHub id", async () => {
    const f: FetchLike = async () => ({ ok: true, status: 200, json: async () => ({ login: "NewName", id: 42 }) });
    expect(await resolveLogin("42", "oldname", { fetchImpl: f })).toBe("NewName");
  });
  it("ignores a response whose id does not match", async () => {
    const f: FetchLike = async () => ({ ok: true, status: 200, json: async () => ({ login: "someone", id: 99 }) });
    expect(await resolveLogin("42", "oldname", { fetchImpl: f })).toBe("oldname");
  });
  it("falls back to the stored login when GitHub is down", async () => {
    const f: FetchLike = async () => {
      throw new Error("down");
    };
    expect(await resolveLogin("42", "oldname", { fetchImpl: f })).toBe("oldname");
  });
  it("throws when no valid login can be found", async () => {
    await expect(resolveLogin(null, null)).rejects.toBeInstanceOf(ImportError);
  });
});
