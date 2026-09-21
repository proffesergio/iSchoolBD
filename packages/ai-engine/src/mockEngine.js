/**
 * Mock Core AI Engine — deterministic, offline, zero-cost.
 * Used for MVP + tests + free-tier fallback when Gemini/OpenAI quota is exhausted.
 * In production, apps/api swaps this with a provider adapter that still validates
 * output through validator.js before sending to the frontend.
 */
import { SWOROBORNO, BANJONBORNO_MVP, ALL_MVP_LETTERS } from "./sworoborna.js";
import { assertValid } from "./validator.js";

const THEMES = ["sundarbans_green", "shahid_minar_dawn", "hilsha_river_blue", "jackfruit_garden"];
const AVATARS = ["tota_moyna_parrot", "kakoli_crow", "bagh_tiger_cub", "dolphin_gangetic"];

function pick(arr, seed) {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
}

export function talkingLetterPayload(letter, { progress = 10, streak = 1.0 } = {}) {
  const entry = ALL_MVP_LETTERS.find((e) => e.letter === letter);
  if (!entry) throw new Error(`Unknown letter: ${letter}. MVP supports ${ALL_MVP_LETTERS.map((e) => e.letter).join(" ")}`);

  const payload = {
    module_metadata: { tier: "tier_1", topic: `sworoborna_${letter}`, progress_percentage: progress },
    ui_component: {
      type: "talking_letter",
      visual_elements: {
        character_avatar: pick(AVATARS, letter),
        background_theme: pick(THEMES, entry.word),
        animation_trigger: "bounce_idle"
      }
    },
    content: {
      instruction_text: `${entry.letter} চাপ দাও! ${entry.word} দেখো ${entry.emoji}`,
      interactive_script: entry.tts,
      challenge: {
        question_type: "phonetic_matching",
        question_body: `${entry.letter} দিয়ে কোন শব্দ? শুনে সঠিক ছবি বাছো!`,
        options: [entry.word, "আম", "গরু", "চাঁদ"].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        correct_answer_index: 0,
        socratic_hint: `শোনো: "${entry.word}" — প্রথম আওয়াজ ${entry.letter}! ঠোঁট কেমন করে? আবার শোনো!`
      }
    },
    gamification: {
      xp_reward: 10,
      streak_multiplier: streak,
      feedback_message: { on_success: "শাবাশ! 🎉", on_failure: "আবার চেষ্টা করো, প্রায় হয়ে গেছে! 💪" }
    }
  };
  // Ensure the correct answer is at index 0 after dedupe; if entry.word was e.g. "আম", options[0] is still correct.
  return assertValid(payload);
}

export function tier2QuizPayload({ topic = "nctb_math_class3_addition", progress = 20 } = {}) {
  const payload = {
    module_metadata: { tier: "tier_2", topic, progress_percentage: progress },
    ui_component: {
      type: "quiz_screen",
      visual_elements: {
        character_avatar: "apu_mentor",
        background_theme: "shahid_minar_dawn",
        animation_trigger: "bounce_idle"
      }
    },
    content: {
      instruction_text: "তাজিমের কাছে ১২টি লিচু, লামিয়া দিল আরও ৯টি। মোট কয়টি? 🍒",
      interactive_script: "চলো ধাপে ধাপে যোগ করি, ভাইয়া সাথে আছি!",
      challenge: {
        question_type: "multiple_choice",
        question_body: "১২ + ৯ = ? (টাকায় হিসাব করলে ৳২১!)",
        options: ["২০", "২১", "২২", "১৯"],
        correct_answer_index: 1,
        socratic_hint: "১২ + ৮ = ২০, তাহলে +১ কত? সরাসরি উত্তর না — এক ধাপ ভাবো!"
      }
    },
    gamification: {
      xp_reward: 20,
      streak_multiplier: 1.2,
      feedback_message: { on_success: "শাবাশ, গণিতবিদ! 🌟", on_failure: "ভুল হলেও শেখা হয়! আবার দেখো 👀" }
    }
  };
  return assertValid(payload);
}

export function tier3SocraticPayload({ topic = "nctb_physics_class9_motion", progress = 30 } = {}) {
  const payload = {
    module_metadata: { tier: "tier_3", topic, progress_percentage: progress },
    ui_component: {
      type: "socratic_hint",
      visual_elements: {
        character_avatar: "tech_coach_robo",
        background_theme: "hilsha_river_blue",
        animation_trigger: "bounce_idle"
      }
    },
    content: {
      instruction_text: "Sundarbans-এ ট্রলার 10 m/s-এ চলে, 5s-এ কত দূর? Straight মুখস্থ না — derive করি!",
      interactive_script: "s = vt মনে আছে? v=10, t=5 — তাহলে s=?",
      challenge: {
        question_type: "fill_in_the_blanks",
        question_body: "s = v × t = 10 × 5 = ___ m",
        options: ["15", "50", "2", "105"],
        correct_answer_index: 1,
        socratic_hint: "গুণটা ভাঙো: 10×5 = 10+10+10+10+10। যোগ করে দেখো, answer reveal করছি না 😉"
      }
    },
    gamification: {
      xp_reward: 30,
      streak_multiplier: 1.5,
      feedback_message: { on_success: "Boom! Physics sorted 🔥", on_failure: "Almost there! Formula-টা আবার check করো" }
    }
  };
  return assertValid(payload);
}

export { SWOROBORNO, BANJONBORNO_MVP };
