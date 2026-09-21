import { describe, it, expect } from "vitest";
import { classHeadlines, shuffled, UNIVERSAL_HEADLINES } from "./headlines";

describe("rotating headlines", () => {
  it("has a full universal pool", () => {
    expect(UNIVERSAL_HEADLINES.length).toBeGreaterThanOrEqual(6);
    for (const h of UNIVERSAL_HEADLINES) {
      expect(h.text.length).toBeGreaterThan(0);
    }
  });

  it("shuffles without losing or duplicating entries", () => {
    const out = shuffled(UNIVERSAL_HEADLINES, () => 0.5);
    expect(out).toHaveLength(UNIVERSAL_HEADLINES.length);
    const key = (h: { text: string }) => h.text;
    expect(out.map(key).sort()).toEqual(UNIVERSAL_HEADLINES.map(key).sort());
  });

  it("is deterministic with a stubbed random", () => {
    expect(shuffled([1, 2, 3], () => 0)).toEqual(shuffled([1, 2, 3], () => 0));
  });

  it("personalizes by age group", () => {
    const little = classHeadlines("Mina", true);
    const big = classHeadlines("Rahim", false);
    expect(little.some((h) => h.text.includes("Mina"))).toBe(true);
    expect(big.some((h) => h.text.includes("Rahim"))).toBe(true);
    expect(little).not.toEqual(big);
  });
});
