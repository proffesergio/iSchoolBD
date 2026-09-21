import { Injectable } from '@nestjs/common';

// Thin TS mirror of @ischool/ai-engine mock for CJS Nest runtime.
// Contract parity is enforced by shared JSON schema + engine tests.
// Provider adapters (Gemini/OpenAI) must still pass validator before responding.
type Tier = 'tier_1' | 'tier_2' | 'tier_3';

const LETTERS: Record<string, { word: string; emoji: string; tts: string }> = {
  'অ': { word: 'অজগর', emoji: '🐍', tts: 'আমি অ! অজগরে অ! বলো আমার সাথে — অ!' },
  'আ': { word: 'আম', emoji: '🥭', tts: 'আমি আ! আমে আ! বলো — আ!' },
  'ই': { word: 'ইঁদুর', emoji: '🐭', tts: 'আমি ই! ইঁদুরে ই! বলো — ই!' },
  'ঈ': { word: 'ঈদ', emoji: '🌙', tts: 'আমি ঈ! ঈদে ঈ! বলো — ঈ!' },
  'উ': { word: 'উট', emoji: '🐪', tts: 'আমি উ! উটে উ! বলো — উ!' },
  'ঊ': { word: 'ঊষা', emoji: '🌅', tts: 'আমি ঊ! ঊষায় ঊ! বলো — ঊ!' },
  'ঋ': { word: 'ঋষি', emoji: '🧙', tts: 'আমি ঋ! ঋষিতে ঋ! বলো — ঋ!' },
  'এ': { word: 'একতারা', emoji: '🎶', tts: 'আমি এ! একতারায় এ! বলো — এ!' },
  'ঐ': { word: 'ঐরাবত', emoji: '🐘', tts: 'আমি ঐ! ঐরাবতে ঐ! বলো — ঐ!' },
  'ও': { word: 'ওজন', emoji: '⚖️', tts: 'আমি ও! ওজনে ও! বলো — ও!' },
  'ঔ': { word: 'ঔষধ', emoji: '💊', tts: 'আমি ঔ! ঔষধে ঔ! বলো — ঔ!' },
  'ক': { word: 'কাক', emoji: '🐦‍⬛', tts: 'কা কা! আমি ক! কাকে ক! বলো — ক!' },
  'খ': { word: 'খরগোশ', emoji: '🐰', tts: 'আমি খ! খরগোশে খ! বলো — খ!' },
  'গ': { word: 'গরু', emoji: '🐄', tts: 'হাম্বা! আমি গ! গরুতে গ! বলো — গ!' },
  'ঘ': { word: 'ঘোড়া', emoji: '🐴', tts: 'আমি ঘ! ঘোড়ায় ঘ! বলো — ঘ!' },
};

export const MVP_LETTERS = Object.keys(LETTERS);

@Injectable()
export class LearnService {
  talkingLetter(letter: string, progress = 10) {
    const entry = LETTERS[letter];
    if (!entry) throw new Error(`Unknown letter: ${letter}`);
    return {
      module_metadata: { tier: 'tier_1' as Tier, topic: `sworoborna_${letter}`, progress_percentage: progress },
      ui_component: {
        type: 'talking_letter',
        visual_elements: {
          character_avatar: 'kakoli_crow',
          background_theme: 'sundarbans_green',
          animation_trigger: 'bounce_idle',
        },
      },
      content: {
        instruction_text: `${letter} চাপ দাও! ${entry.word} দেখো ${entry.emoji}`,
        interactive_script: entry.tts,
        challenge: {
          question_type: 'phonetic_matching',
          question_body: `${letter} দিয়ে কোন শব্দ? শুনে সঠিক ছবি বাছো!`,
          options: [entry.word, 'আম', 'গরু', 'চাঁদ'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
          correct_answer_index: 0,
          socratic_hint: `শোনো: "${entry.word}" — প্রথম আওয়াজ ${letter}!`,
        },
      },
      gamification: {
        xp_reward: 10,
        streak_multiplier: 1.0,
        feedback_message: { on_success: 'শাবাশ! 🎉', on_failure: 'আবার চেষ্টা করো, প্রায় হয়ে গেছে! 💪' },
      },
    };
  }

  tier2Quiz() {
    return {
      module_metadata: { tier: 'tier_2' as Tier, topic: 'nctb_math_class3_addition', progress_percentage: 20 },
      ui_component: {
        type: 'quiz_screen',
        visual_elements: { character_avatar: 'apu_mentor', background_theme: 'shahid_minar_dawn', animation_trigger: 'bounce_idle' },
      },
      content: {
        instruction_text: 'তাজিমের কাছে ১২টি লিচু, লামিয়া দিল আরও ৯টি। মোট কয়টি? 🍒',
        interactive_script: 'চলো ধাপে ধাপে যোগ করি!',
        challenge: {
          question_type: 'multiple_choice',
          question_body: '১২ + ৯ = ? (৳২১!)',
          options: ['২০', '২১', '২২', '১৯'],
          correct_answer_index: 1,
          socratic_hint: '১২ + ৮ = ২০, তাহলে +১ কত?',
        },
      },
      gamification: {
        xp_reward: 20,
        streak_multiplier: 1.2,
        feedback_message: { on_success: 'শাবাশ, গণিতবিদ! 🌟', on_failure: 'ভুল হলেও শেখা হয়! 👀' },
      },
    };
  }

  tier3Socratic() {
    return {
      module_metadata: { tier: 'tier_3' as Tier, topic: 'nctb_physics_class9_motion', progress_percentage: 30 },
      ui_component: {
        type: 'socratic_hint',
        visual_elements: { character_avatar: 'tech_coach_robo', background_theme: 'hilsha_river_blue', animation_trigger: 'bounce_idle' },
      },
      content: {
        instruction_text: 'Sundarbans-এ ট্রলার 10 m/s-এ চলে, 5s-এ কত দূর?',
        interactive_script: 's = vt মনে আছে? v=10, t=5 — তাহলে s=?',
        challenge: {
          question_type: 'fill_in_the_blanks',
          question_body: 's = v × t = 10 × 5 = ___ m',
          options: ['15', '50', '2', '105'],
          correct_answer_index: 1,
          socratic_hint: 'গুণটা ভাঙো: 10×5 = 10+10+10+10+10।',
        },
      },
      gamification: {
        xp_reward: 30,
        streak_multiplier: 1.5,
        feedback_message: { on_success: 'Boom! Physics sorted 🔥', on_failure: 'Almost there! Formula-টা আবার check করো' },
      },
    };
  }
}
