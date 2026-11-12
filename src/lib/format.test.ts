import { describe, expect, it } from "vitest";
import { fmtDate } from "./format";
import { safeNext } from "./auth";
import { tooSoon } from "./throttle";

describe("fmtDate", () => {
  it("formats ISO dates the same everywhere", () => {
    expect(fmtDate("2026-03-02")).toBe("2 Mar 2026");
    expect(fmtDate("2026-11-10T10:00:00Z")).toBe("10 Nov 2026");
  });
  it("returns an empty string for bad input", () => {
    expect(fmtDate("nope")).toBe("");
    expect(fmtDate("")).toBe("");
  });
});

describe("safeNext (open-redirect protection)", () => {
  it("allows in-site paths", () => {
    expect(safeNext("/create")).toBe("/create");
  });
  it("blocks external and tricky targets", () => {
    for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "", null, undefined]) {
      expect(safeNext(bad as string | null | undefined)).toBe("/dashboard");
    }
  });
});

describe("tooSoon", () => {
  it("allows the first call and blocks an immediate repeat", () => {
    const key = `test-${Math.random()}`;
    expect(tooSoon(key, 5000)).toBe(false);
    expect(tooSoon(key, 5000)).toBe(true);
  });
  it("does not mix up different keys", () => {
    expect(tooSoon(`a-${Math.random()}`, 5000)).toBe(false);
    expect(tooSoon(`b-${Math.random()}`, 5000)).toBe(false);
  });
});
