import { describe, it, expect } from "vitest";
import { makeStars, seededRandom, starCountFor, twinkle } from "./cosmos";

describe("cosmos background math", () => {
  it("generates a stable, bounded starfield", () => {
    const a = makeStars(150);
    const b = makeStars(150);
    expect(a).toEqual(b);
    expect(a).toHaveLength(150);
    for (const s of a) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThan(1);
      expect(s.r).toBeGreaterThan(0);
    }
    expect(makeStars(150, 7)).not.toEqual(makeStars(150, 8));
  });

  it("scales star count with viewport, capped", () => {
    expect(starCountFor(390, 844)).toBeGreaterThanOrEqual(90);
    expect(starCountFor(3840, 2160)).toBeLessThanOrEqual(420);
    expect(starCountFor(0, 0)).toBe(90);
  });

  it("twinkles within visible range", () => {
    const [s] = makeStars(1);
    for (const t of [0, 1, 5, 30]) {
      const v = twinkle(s, t);
      expect(v).toBeGreaterThanOrEqual(0.3);
      expect(v).toBeLessThanOrEqual(1.05);
    }
  });

  it("seeded RNG is deterministic", () => {
    const r1 = seededRandom(42);
    const r2 = seededRandom(42);
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()]);
  });
});
