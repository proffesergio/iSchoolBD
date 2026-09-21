export type Tier = "tier_1" | "tier_2" | "tier_3";
export type UIType = "talking_letter" | "quiz_screen" | "socratic_hint" | "dashboard_reward";
export type AnimationTrigger = "success_sparkle" | "shake_error" | "bounce_idle" | "pop_expand" | "confetti_burst";

export interface EnginePayload {
  module_metadata: { tier: Tier; topic: string; progress_percentage: number };
  ui_component: {
    type: UIType;
    visual_elements: { character_avatar: string; background_theme: string; animation_trigger: AnimationTrigger };
  };
  content: {
    instruction_text: string;
    interactive_script?: string;
    challenge?: {
      question_type: "multiple_choice" | "word_rearrange" | "phonetic_matching" | "fill_in_the_blanks";
      question_body: string;
      options: string[];
      correct_answer_index: number;
      socratic_hint?: string;
    };
  };
  gamification: {
    xp_reward: number;
    streak_multiplier: number;
    feedback_message: { on_success: string; on_failure: string };
  };
}

export interface LetterEntry {
  letter: string;
  word: string;
  meaning_bn: string;
  emoji: string;
  tts: string;
}
