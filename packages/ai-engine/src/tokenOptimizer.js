/**
 * Token optimizer — keeps prompts/responses cheap on free-tier LLMs.
 * Rough heuristic: 1 token ≈ 4 chars (Bangla script is denser; we use 3 chars/token to be safe).
 */

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(String(text).length / 3);
}

export function truncateToTokenBudget(text, maxTokens) {
  const maxChars = maxTokens * 3;
  if (String(text).length <= maxChars) return String(text);
  return String(text).slice(0, maxChars - 1) + "…";
}

// Build a minimal prompt for an LLM provider that enforces the strict JSON schema.
// Keeps system prompt short for free-tier efficiency.
export function buildEfficientPrompt({ tier, topic, letter }) {
  const base = `You are iSchool BD AI. Tier=${tier}. Topic=${topic}. Output ONLY valid JSON matching iSchool schema. Bangla-first, bite-sized (<500 chars instruction), joyful. No politics/religion.`;
  if (letter) return `${base} Letter=${letter}. Type=talking_letter. Include tts script + phonetic_matching challenge.`;
  return `${base} Type=quiz_screen. Include 1 micro-challenge only.`;
}
