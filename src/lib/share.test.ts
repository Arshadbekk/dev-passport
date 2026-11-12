import { describe, expect, it } from "vitest";
import { decodePassport, encodePassport, safeUrl, sanitizePassport } from "./share";
import { samplePassport } from "./sample";

describe("safeUrl", () => {
  it("keeps http and https URLs", () => {
    expect(safeUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(safeUrl("http://example.com/")).toBe("http://example.com/");
  });
  it("blocks dangerous or invalid values", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("");
    expect(safeUrl("data:text/html,x")).toBe("");
    expect(safeUrl("not a url")).toBe("");
    expect(safeUrl(42)).toBe("");
  });
});

describe("sanitizePassport", () => {
  it("never trusts the verified flag", () => {
    const p = sanitizePassport({ name: "x", stamps: [{ title: "t", category: "Project", verified: true, proofUrl: "https://a.com" }] });
    expect(p?.stamps[0].verified).toBe(false);
  });
  it("drops unsafe proof links and invalid categories", () => {
    const p = sanitizePassport({ stamps: [{ title: "t", category: "Nope", proofUrl: "javascript:alert(1)" }] });
    expect(p?.stamps[0].proofUrl).toBe("");
    expect(p?.stamps[0].category).toBe("Project");
  });
  it("enforces limits", () => {
    const stack = Array.from({ length: 50 }, (_, i) => `s${i}`);
    const p = sanitizePassport({ name: "n".repeat(500), stack });
    expect(p?.name).toHaveLength(80);
    expect(p?.stack).toHaveLength(20);
  });
  it("rejects non-objects", () => {
    expect(sanitizePassport(null)).toBeNull();
    expect(sanitizePassport("text")).toBeNull();
  });
  it("does not carry a passport number from untrusted data", () => {
    const p = sanitizePassport({ name: "x", passportNo: "DP-2026-000001" });
    expect(p?.passportNo).toBeUndefined();
  });
});

describe("encode / decode", () => {
  it("round-trips a passport and resets verified", () => {
    const back = decodePassport(encodePassport(samplePassport));
    expect(back?.name).toBe(samplePassport.name);
    expect(back?.stamps).toHaveLength(samplePassport.stamps.length);
    expect(back?.stamps.some((s) => s.verified)).toBe(false);
  });
  it("supports non-Latin text and emoji", () => {
    const back = decodePassport(encodePassport({ ...samplePassport, name: "أحمد 🚀" }));
    expect(back?.name).toBe("أحمد 🚀");
  });
  it("returns null for garbage", () => {
    expect(decodePassport("%%%")).toBeNull();
    expect(decodePassport("")).toBeNull();
  });
});
