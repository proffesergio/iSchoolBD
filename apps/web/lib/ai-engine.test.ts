import { describe, it, expect } from "vitest";
import { addXp, progressAfter } from "./ai-engine";

describe("gamification math (TDD)", () => {
  it("adds XP with streak multiplier", () => {
    expect(addXp(0, 10, 1.0)).toBe(10);
    expect(addXp(10, 10, 1.5)).toBe(25);
  });
  it("computes progress %", () => {
    expect(progressAfter(0, 15)).toBe(0);
    expect(progressAfter(15, 15)).toBe(100);
    expect(progressAfter(200, 15)).toBe(100);
  });
});
