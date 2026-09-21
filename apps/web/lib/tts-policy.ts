/**
 * TTS policy — autoplay speech ONLY for early-childhood materials
 * (preschool → class 2, Tier 1). Everywhere else (class 3+, Tier 2/3,
 * gates, chrome) speech is removed; content is visual text, with
 * tap-to-hear 🔊 buttons and admin-uploaded voice-overs instead.
 *
 * Tap-to-speak inside child materials (BookPage taps, TalkingLetter
 * replay) is always allowed — the child asked for it.
 */

export type TtsScope =
  | "preschool"
  | "class-1"
  | "class-2"
  | "class-3"
  | "class-4"
  | "class-5"
  | "tier-1"
  | "tier-2"
  | "tier-3"
  | "general";

const AUTO_SPEAK_SCOPES: ReadonlySet<TtsScope> = new Set([
  "preschool",
  "class-1",
  "class-2",
  "tier-1",
]);

/** May this surface speak on its own (mount, lesson change, feedback)? */
export function autoSpeakAllowed(scope: TtsScope): boolean {
  return AUTO_SPEAK_SCOPES.has(scope);
}
