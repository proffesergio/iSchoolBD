/**
 * ischool-bd — Global canonical contract (Section 4.1)
 * Used by all AI Route Handlers (`/app/api/ai/...`) and tier widgets.
 * strict: true, no `any`. JSON-serializable only (Edge-compatible).
 *
 * NOTE — divergence from legacy engine:
 * Legacy `packages/ai-engine/ischool.schema.json` + `apps/web/lib/types.ts`
 * use snake_case (`module_metadata`, `talking_letter`, `quiz_screen`...).
 * This file is the canonical camelCase Section 4.1 contract for NEW code.
 * Use `toLegacyEnginePayload()` adapter when talking to the existing PWA/NestJS backend.
 */

export type TierId = "tier_1" | "tier_2" | "tier_3";

export type UiComponentType =
  | "talking_letter"
  | "gamified_quiz"
  | "socratic_hint"
  | "admin_stat_panel";

export type OnScreenAnimation =
  | "success_sparkle"
  | "shake_error"
  | "bounce_idle"
  | "pulse_active";

export type ChallengeType = "mcq" | "rearrange" | "phonetic_tap" | "fill_blank";

export interface EdTechContentPayload {
  moduleMetadata: {
    tier: TierId;
    academicTopic: string;
    progressPercentage: number; // 0-100 int
  };
  uiComponent: {
    type: UiComponentType;
    renderingProps: {
      avatarIdentifier: string;
      visualTheme: string;
      onScreenAnimation: OnScreenAnimation;
    };
  };
  payloadContent: {
    displayInstruction: string;
    audioScriptText?: string;
    challengeBlock?: {
      type: ChallengeType;
      prompt: string;
      choices: string[];
      correctChoiceIndex: number;
      socraticHintProgression: string[];
    };
  };
  gamificationMetrics: {
    baseXpAllocated: number;
    streakMultiplierAwarded: number; // 1.0 - 5.0
    feedbackVariants: {
      onSuccessMessage: string;
      onFailureMessage: string;
    };
  };
}

// ---- Tier metadata (Section 3) ----

export interface TierMetadata {
  id: TierId;
  ageRange: string;
  focus: string;
  componentPattern: string;
  tone: string;
}

export const TIER_METADATA: readonly TierMetadata[] = [
  {
    id: "tier_1",
    ageRange: "Ages 2-5",
    focus: "Bengali & English letter recognition, phonics, object naming",
    componentPattern: "<TalkingLetter />",
    tone: "Animated, high-patience, purely visual",
  },
  {
    id: "tier_2",
    ageRange: "Grades 1-5",
    focus: "NCTB foundational math, language syntax, storytelling",
    componentPattern: "Duolingo-style progression trees, matching pairs",
    tone: "Encouraging older sibling persona (Apu/Bhaiya)",
  },
  {
    id: "tier_3",
    ageRange: "Grades 6-10",
    focus: "Complex STEM + Board Exam Prep",
    componentPattern: "Socratic step-by-step hints, markdown MCQ modules",
    tone: "Tech-forward coach, Banglish code-switching",
  },
] as const;

// ---- Legacy snake_case engine shape (existing PWA — do not break) ----

export interface LegacyEnginePayload {
  module_metadata: { tier: TierId; topic: string; progress_percentage: number };
  ui_component: {
    type: "talking_letter" | "quiz_screen" | "socratic_hint" | "dashboard_reward";
    visual_elements: {
      character_avatar: string;
      background_theme: string;
      animation_trigger:
        | "success_sparkle"
        | "shake_error"
        | "bounce_idle"
        | "pop_expand"
        | "confetti_burst";
    };
  };
  content: {
    instruction_text: string;
    interactive_script?: string;
    challenge?: {
      question_type:
        | "multiple_choice"
        | "word_rearrange"
        | "phonetic_matching"
        | "fill_in_the_blanks";
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

/**
 * Adapter: canonical (camelCase) -> legacy PWA payload (snake_case).
 * Keeps Tier 1 TalkingLetter PWA working while new AI routes adopt Section 4.1.
 */
export function toLegacyEnginePayload(p: EdTechContentPayload): LegacyEnginePayload {
  const uiTypeMap: Record<UiComponentType, LegacyEnginePayload["ui_component"]["type"]> = {
    talking_letter: "talking_letter",
    gamified_quiz: "quiz_screen",
    socratic_hint: "socratic_hint",
    admin_stat_panel: "dashboard_reward",
  };
  const animMap: Record<OnScreenAnimation, LegacyEnginePayload["ui_component"]["visual_elements"]["animation_trigger"]> = {
    success_sparkle: "success_sparkle",
    shake_error: "shake_error",
    bounce_idle: "bounce_idle",
    pulse_active: "pop_expand",
  };
  const qTypeMap: Record<ChallengeType, NonNullable<LegacyEnginePayload["content"]["challenge"]>["question_type"]> = {
    mcq: "multiple_choice",
    rearrange: "word_rearrange",
    phonetic_tap: "phonetic_matching",
    fill_blank: "fill_in_the_blanks",
  };

  return {
    module_metadata: {
      tier: p.moduleMetadata.tier,
      topic: p.moduleMetadata.academicTopic,
      progress_percentage: p.moduleMetadata.progressPercentage,
    },
    ui_component: {
      type: uiTypeMap[p.uiComponent.type],
      visual_elements: {
        character_avatar: p.uiComponent.renderingProps.avatarIdentifier,
        background_theme: p.uiComponent.renderingProps.visualTheme,
        animation_trigger: animMap[p.uiComponent.renderingProps.onScreenAnimation],
      },
    },
    content: {
      instruction_text: p.payloadContent.displayInstruction,
      interactive_script: p.payloadContent.audioScriptText,
      challenge: p.payloadContent.challengeBlock
        ? {
            question_type: qTypeMap[p.payloadContent.challengeBlock.type],
            question_body: p.payloadContent.challengeBlock.prompt,
            options: p.payloadContent.challengeBlock.choices,
            correct_answer_index: p.payloadContent.challengeBlock.correctChoiceIndex,
            socratic_hint: p.payloadContent.challengeBlock.socraticHintProgression[0],
          }
        : undefined,
    },
    gamification: {
      xp_reward: p.gamificationMetrics.baseXpAllocated,
      streak_multiplier: p.gamificationMetrics.streakMultiplierAwarded,
      feedback_message: {
        on_success: p.gamificationMetrics.feedbackVariants.onSuccessMessage,
        on_failure: p.gamificationMetrics.feedbackVariants.onFailureMessage,
      },
    },
  };
}

/**
 * Adapter: legacy PWA payload (snake_case) -> canonical Section 4.1.
 * Lets the NestJS/mock engine responses flow into new canonical UI
 * (QuizSheet, /api/ai/track) without rewriting the engine.
 * Note: confetti_burst has no canonical twin and maps to success_sparkle.
 */
export function toCanonicalPayload(p: LegacyEnginePayload): EdTechContentPayload {
  const uiTypeMap: Record<
    LegacyEnginePayload["ui_component"]["type"],
    UiComponentType
  > = {
    talking_letter: "talking_letter",
    quiz_screen: "gamified_quiz",
    socratic_hint: "socratic_hint",
    dashboard_reward: "admin_stat_panel",
  };
  const animMap: Record<
    LegacyEnginePayload["ui_component"]["visual_elements"]["animation_trigger"],
    OnScreenAnimation
  > = {
    success_sparkle: "success_sparkle",
    shake_error: "shake_error",
    bounce_idle: "bounce_idle",
    pop_expand: "pulse_active",
    confetti_burst: "success_sparkle",
  };
  const qTypeMap: Record<
    NonNullable<LegacyEnginePayload["content"]["challenge"]>["question_type"],
    ChallengeType
  > = {
    multiple_choice: "mcq",
    word_rearrange: "rearrange",
    phonetic_matching: "phonetic_tap",
    fill_in_the_blanks: "fill_blank",
  };

  return {
    moduleMetadata: {
      tier: p.module_metadata.tier,
      academicTopic: p.module_metadata.topic,
      progressPercentage: p.module_metadata.progress_percentage,
    },
    uiComponent: {
      type: uiTypeMap[p.ui_component.type],
      renderingProps: {
        avatarIdentifier: p.ui_component.visual_elements.character_avatar,
        visualTheme: p.ui_component.visual_elements.background_theme,
        onScreenAnimation: animMap[p.ui_component.visual_elements.animation_trigger],
      },
    },
    payloadContent: {
      displayInstruction: p.content.instruction_text,
      audioScriptText: p.content.interactive_script,
      challengeBlock: p.content.challenge
        ? {
            type: qTypeMap[p.content.challenge.question_type],
            prompt: p.content.challenge.question_body,
            choices: p.content.challenge.options,
            correctChoiceIndex: p.content.challenge.correct_answer_index,
            socraticHintProgression: p.content.challenge.socratic_hint
              ? [p.content.challenge.socratic_hint]
              : [],
          }
        : undefined,
    },
    gamificationMetrics: {
      baseXpAllocated: p.gamification.xp_reward,
      streakMultiplierAwarded: p.gamification.streak_multiplier,
      feedbackVariants: {
        onSuccessMessage: p.gamification.feedback_message.on_success,
        onFailureMessage: p.gamification.feedback_message.on_failure,
      },
    },
  };
}
