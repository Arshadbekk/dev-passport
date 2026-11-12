import { describe, expect, it } from "vitest";
import { ImportError, type FetchLike } from "./githubImport";
import { fetchPrivateContributions, fetchRepo, isFullName, isPickable, listOwnRepos, privateStamp, verifiedRepoStamp, type RepoInfo } from "./githubProjects";

const repo = (o: Partial<RepoInfo> = {}): RepoInfo => ({
  name: "habit_tracker", full_name: "aisha/habit_tracker", description: "demo", language: "Dart", stargazers_count: 3,
  pushed_at: "2026-04-18T10:00:00Z", created_at: "2025-01-01T00:00:00Z", html_url: "https://github.com/aisha/habit_tracker",
  fork: false, private: false, owner: { login: "Aisha" }, ...o,
});

describe("verifiedRepoStamp", () => {
  it("builds a verified Project stamp for an owned public repo", () => {
    expect(verifiedRepoStamp(repo(), "aisha")).toEqual({
      external_id: "github:own:aisha/habit_tracker", title: "Built habit_tracker (Dart)", category: "Project",
      earned_on: "2026-04-18", proof_url: "https://github.com/aisha/habit_tracker",
    });
  });
  it("omits the language when unknown", () => {
    expect(verifiedRepoStamp(repo({ language: null }), "aisha").title).toBe("Built habit_tracker");
  });
  it("rejects private repositories", () => {
    expect(() => verifiedRepoStamp(repo({ private: true }), "aisha")).toThrow(ImportError);
  });
  it("rejects forks", () => {
    expect(() => verifiedRepoStamp(repo({ fork: true }), "aisha")).toThrow(ImportError);
  });
  it("rejects repositories owned by someone else", () => {
    expect(() => verifiedRepoStamp(repo({ owner: { login: "someone" } }), "aisha")).toThrow(ImportError);
  });
  it("rejects unexpected URLs", () => {
    expect(() => verifiedRepoStamp(repo({ html_url: "https://evil.com/x" }), "aisha")).toThrow(ImportError);
  });
});

describe("isFullName (blocks path tricks)", () => {
  it("accepts valid names", () => {
    expect(isFullName("a/b")).toBe(true);
    expect(isFullName("a/my_repo.v2")).toBe(true);
  });
  it("rejects invalid or dangerous names", () => {
    for (const bad of ["a/b/c", "a b/c", "../x", "a/..", "a/.", "-a/b", `a/${"x".repeat(101)}`]) {
      expect(isFullName(bad)).toBe(false);
    }
  });
});

describe("repository listing", () => {
  it("only offers public, non-fork repositories owned by the user", async () => {
    const f: FetchLike = async () => ({
      ok: true, status: 200,
      json: async () => [repo(), repo({ name: "f", full_name: "aisha/f", fork: true }), repo({ name: "o", full_name: "x/o", owner: { login: "x" } })],
    });
    expect((await listOwnRepos("aisha", { fetchImpl: f })).map((r) => r.name)).toEqual(["habit_tracker"]);
    expect([isPickable(repo(), "aisha"), isPickable(repo({ private: true }), "aisha")]).toEqual([true, false]);
  });
  it("fetchRepo validates the name and the response", async () => {
    const ok: FetchLike = async () => ({ ok: true, status: 200, json: async () => repo() });
    expect((await fetchRepo("aisha/habit_tracker", { fetchImpl: ok })).name).toBe("habit_tracker");
    await expect(fetchRepo("bad name", { fetchImpl: ok })).rejects.toMatchObject({ status: 400 });
    const mismatch: FetchLike = async () => ({ ok: true, status: 200, json: async () => repo({ full_name: "other/repo" }) });
    await expect(fetchRepo("aisha/habit_tracker", { fetchImpl: mismatch })).rejects.toMatchObject({ status: 422 });
  });
});

describe("private contributions", () => {
  const gql = (n: unknown, extra: object = {}): FetchLike => async () => ({
    ok: true, status: 200,
    json: async () => ({ data: { user: { contributionsCollection: { restrictedContributionsCount: n } } }, ...extra }),
  });
  it("returns the count GitHub reports", async () => {
    expect(await fetchPrivateContributions("aisha", { token: "tok", fetchImpl: gql(412) })).toBe(412);
  });
  it("needs a server token", async () => {
    await expect(fetchPrivateContributions("aisha", { fetchImpl: gql(1) })).rejects.toMatchObject({ status: 503 });
  });
  it("fails clearly on GraphQL errors", async () => {
    await expect(fetchPrivateContributions("aisha", { token: "t", fetchImpl: gql(1, { errors: [{}] }) })).rejects.toMatchObject({ status: 502 });
  });
  it("builds a stamp only when the count is positive", () => {
    const now = new Date("2026-11-11T00:00:00Z");
    expect(privateStamp(412, "aisha", now)?.title).toBe("412 contributions to private repositories in the last 12 months");
    expect(privateStamp(1, "aisha", now)?.title).toBe("1 contribution to private repositories in the last 12 months");
    expect(privateStamp(0, "aisha", now)).toBeNull();
  });
});
