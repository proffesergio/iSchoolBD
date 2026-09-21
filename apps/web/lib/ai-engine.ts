import type { EnginePayload } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

// Offline fallback mirrors packages/ai-engine mock so the PWA works without backend.
const FALLBACK_WORDS: Record<string, { word: string; emoji: string; tts: string }> = {
  "অ": { word: "অজগর", emoji: "🐍", tts: "আমি অ! অজগরে অ! বলো — অ!" },
  "আ": { word: "আম", emoji: "🥭", tts: "আমি আ! আমে আ! বলো — আ!" },
  "ই": { word: "ইঁদুর", emoji: "🐭", tts: "আমি ই! ইঁদুরে ই! বলো — ই!" },
  "ঈ": { word: "ঈদ", emoji: "🌙", tts: "আমি ঈ! ঈদে ঈ! বলো — ঈ!" },
  "উ": { word: "উট", emoji: "🐪", tts: "আমি উ! উটে উ! বলো — উ!" },
  "ঊ": { word: "ঊষা", emoji: "🌅", tts: "আমি ঊ! ঊষায় ঊ! বলো — ঊ!" },
  "ঋ": { word: "ঋষি", emoji: "🧙", tts: "আমি ঋ! ঋষিতে ঋ! বলো — ঋ!" },
  "এ": { word: "একতারা", emoji: "🎶", tts: "আমি এ! একতারায় এ! বলো — এ!" },
  "ঐ": { word: "ঐরাবত", emoji: "🐘", tts: "আমি ঐ! ঐরাবতে ঐ! বলো — ঐ!" },
  "ও": { word: "ওজন", emoji: "⚖️", tts: "আমি ও! ওজনে ও! বলো — ও!" },
  "ঔ": { word: "ঔষধ", emoji: "💊", tts: "আমি ঔ! ঔষধে ঔ! বলো — ঔ!" },
  "ক": { word: "কাক", emoji: "🐦‍⬛", tts: "কা কা! আমি ক! কাকে ক! বলো — ক!" },
  "খ": { word: "খরগোশ", emoji: "🐰", tts: "আমি খ! খরগোশে খ! বলো — খ!" },
  "গ": { word: "গরু", emoji: "🐄", tts: "হাম্বা! আমি গ! গরুতে গ! বলো — গ!" },
  "ঘ": { word: "ঘোড়া", emoji: "🐴", tts: "আমি ঘ! ঘোড়ায় ঘ! বলো — ঘ!" },
};

export const MVP_LETTERS = Object.keys(FALLBACK_WORDS);

function fallbackPayload(letter: string): EnginePayload {
  const e = FALLBACK_WORDS[letter] ?? { word: "কাক", emoji: "🐦‍⬛", tts: "বলো!" };
  return {
    module_metadata: { tier: "tier_1", topic: `sworoborna_${letter}`, progress_percentage: 10 },
    ui_component: {
      type: "talking_letter",
      visual_elements: { character_avatar: "kakoli_crow", background_theme: "sundarbans_green", animation_trigger: "bounce_idle" }
    },
    content: {
      instruction_text: `${letter} চাপ দাও! ${e.word} দেখো ${e.emoji}`,
      interactive_script: e.tts,
      challenge: {
        question_type: "phonetic_matching",
        question_body: `${letter} দিয়ে কোন শব্দ?`,
        options: [e.word, "আম", "গরু", "চাঁদ"].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        correct_answer_index: 0,
        socratic_hint: `প্রথম আওয়াজ ${letter}!`
      }
    },
    gamification: {
      xp_reward: 10,
      streak_multiplier: 1.0,
      feedback_message: { on_success: "শাবাশ! 🎉", on_failure: "আবার চেষ্টা করো! 💪" }
    }
  };
}

export async function fetchTalkingLetter(letter: string): Promise<EnginePayload> {
  try {
    const r = await fetch(`${API_BASE}/learn/talking-letter/${encodeURIComponent(letter)}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return (await r.json()) as EnginePayload;
  } catch {
    return fallbackPayload(letter);
  }
}

export function speakBangla(text: string) {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "bn-BD";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* no-op for tests */ }
}

// Pure helpers (unit-tested with vitest)
export function addXp(current: number, reward: number, streak: number) {
  return current + Math.round(reward * streak);
}
export function progressAfter(seen: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((seen / total) * 100));
}
