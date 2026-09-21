/**
 * Tracing geometry — pure core behind TraceCanvas.
 * The canvas samples its light-gray guide glyph into coarse cells;
 * finger strokes mark cells as touched. Coverage = touched ∩ guide / guide.
 */

export const TRACE_CELL = 16;
export const TRACE_PASS_SCORE = 60;

export function cellKey(col: number, row: number): string {
  return `${col}:${row}`;
}

export function pointToCell(
  x: number,
  y: number,
  cellSize: number
): { col: number; row: number } {
  return {
    col: Math.max(0, Math.floor(x / cellSize)),
    row: Math.max(0, Math.floor(y / cellSize)),
  };
}

/** Integer 0–100. Empty guide → 0 (never auto-pass). */
export function coverageScore(touchedInsideGuide: number, guideCells: number): number {
  if (guideCells <= 0) return 0;
  const clamped = Math.min(touchedInsideGuide, guideCells);
  return Math.round((clamped / guideCells) * 100);
}

export function passesTrace(score: number): boolean {
  return score >= TRACE_PASS_SCORE;
}
