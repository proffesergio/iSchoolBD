/**
 * SVG chart geometry for the admin Activity chart.
 * Catmull-Rom → cubic Bézier smoothing over evenly spaced points.
 */

export interface ChartDot {
  x: number;
  y: number;
}

export interface ChartGeometry {
  line: string;
  area: string;
  dots: ChartDot[];
}

function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

export function chartGeometry(values: number[], w: number, h: number, pad = 8): ChartGeometry {
  const empty: ChartGeometry = { line: "", area: "", dots: [] };
  const clean = values.map((v) => (Number.isFinite(v) && v >= 0 ? v : 0));
  if (clean.length === 0 || w <= 0 || h <= 0) return empty;
  const max = Math.max(1, ...clean);
  const iw = w - pad * 2;
  const ih = h - pad * 2 - 14; // room for labels
  const px = (i: number) => pad + (clean.length === 1 ? iw / 2 : (i / (clean.length - 1)) * iw);
  const py = (v: number) => pad + ih - (v / max) * ih;
  const dots = clean.map((v, i) => ({ x: px(i), y: py(v) }));
  if (dots.length === 1) {
    const d = `M ${fmt(dots[0].x)} ${fmt(dots[0].y)}`;
    return { line: d, area: `${d} L ${fmt(dots[0].x)} ${fmt(h - 2)} Z`, dots };
  }
  let line = `M ${fmt(dots[0].x)} ${fmt(dots[0].y)}`;
  for (let i = 0; i < dots.length - 1; i++) {
    const p0 = dots[Math.max(0, i - 1)];
    const p1 = dots[i];
    const p2 = dots[i + 1];
    const p3 = dots[Math.min(dots.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  const area = `${line} L ${fmt(dots[dots.length - 1].x)} ${fmt(h - 2)} L ${fmt(dots[0].x)} ${fmt(h - 2)} Z`;
  return { line, area, dots };
}
