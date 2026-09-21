import { describe, it, expect } from "vitest";
import {
  TRACE_PASS_SCORE,
  cellKey,
  coverageScore,
  passesTrace,
  pointToCell,
} from "./trace";

describe("tracing geometry (TDD)", () => {
  it("keys cells and clamps points to the grid", () => {
    expect(cellKey(2, 3)).toBe("2:3");
    expect(pointToCell(31, 33, 16)).toEqual({ col: 1, row: 2 });
    expect(pointToCell(-5, -5, 16)).toEqual({ col: 0, row: 0 });
  });

  it("scores coverage 0–100 and never passes on an empty guide", () => {
    expect(coverageScore(0, 100)).toBe(0);
    expect(coverageScore(60, 100)).toBe(60);
    expect(coverageScore(150, 100)).toBe(100);
    expect(coverageScore(5, 0)).toBe(0);
  });

  it("passes at the 60% mark", () => {
    expect(TRACE_PASS_SCORE).toBe(60);
    expect(passesTrace(60)).toBe(true);
    expect(passesTrace(59)).toBe(false);
  });
});
