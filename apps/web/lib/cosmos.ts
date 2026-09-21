/**
 * Cosmos helpers — deterministic starfield math for the galactic background.
 * Pure functions (seeded RNG) so the sky is stable per mount and unit-tested.
 */

export interface Star {
  x: number; // 0..1 across
  y: number; // 0..1 down
  r: number; // radius px at 1080p reference
  phase: number; // twinkle offset radians
  speed: number; // parallax drift factor
  hue: "white" | "cyan" | "gold" | "violet";
}

/** Mulberry32 — tiny seeded RNG, stable sky between renders. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HUES: Star["hue"][] = ["white", "white", "white", "cyan", "gold", "violet"];

/** Generate `count` stars in normalized coordinates. */
export function makeStars(count: number, seed = 20260921): Star[] {
  const rand = seededRandom(seed);
  return Array.from({ length: Math.max(0, Math.floor(count)) }, () => ({
    x: rand(),
    y: rand(),
    r: 0.6 + rand() * 1.6,
    phase: rand() * Math.PI * 2,
    speed: 0.2 + rand() * 0.8,
    hue: HUES[Math.floor(rand() * HUES.length)],
  }));
}

/** Star count scales with viewport area, capped for phones. */
export function starCountFor(width: number, height: number): number {
  const n = Math.round(((width * height) / 9000) * 0.9);
  return Math.min(420, Math.max(90, n));
}

/** Twinkle brightness 0.35..1 for a star at time `t` seconds. */
export function twinkle(star: Star, t: number): number {
  return 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (0.6 + star.speed) + star.phase));
}

/** Honor reduced motion: no canvas animation, static stars + gradients. */
export function shouldAnimate(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
