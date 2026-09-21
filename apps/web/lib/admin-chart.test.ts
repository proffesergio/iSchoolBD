import { describe, it, expect } from "vitest";
import { chartGeometry } from "./admin-chart";

describe("admin chart geometry", () => {
  it("returns empty geometry for empty or degenerate input", () => {
    expect(chartGeometry([], 300, 120)).toEqual({ line: "", area: "", dots: [] });
    expect(chartGeometry([1, 2], 0, 120).line).toBe("");
  });

  it("handles a single value", () => {
    const g = chartGeometry([5], 300, 120);
    expect(g.dots).toHaveLength(1);
    expect(g.line.startsWith("M ")).toBe(true);
    expect(g.area.endsWith("Z")).toBe(true);
  });

  it("builds a smooth path through all points", () => {
    const g = chartGeometry([2, 8, 4, 9, 3], 300, 120);
    expect(g.dots).toHaveLength(5);
    expect(g.line).toContain("C ");
    const xs = g.dots.map((d) => d.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    for (const d of g.dots) {
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.y).toBeGreaterThanOrEqual(0);
    }
  });

  it("treats bad values as zero", () => {
    const g = chartGeometry([NaN, -4, 6], 300, 120);
    expect(g.dots).toHaveLength(3);
    expect(g.dots[0].y).toBe(g.dots[1].y);
  });
});
