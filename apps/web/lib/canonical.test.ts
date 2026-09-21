import { describe, it, expect } from "vitest";
import type { EdTechContentPayload, LegacyEnginePayload } from "../types/edtech";
import { toCanonicalPayload, toLegacyEnginePayload } from "../types/edtech";

const LEGACY_FIXTURE: LegacyEnginePayload = {
  module_metadata: { tier: "tier_2", topic: "nctb_math_class3_addition", progress_percentage: 20 },
  ui_component: {
    type: "quiz_screen",
    visual_elements: {
      character_avatar: "apu_mentor",
      background_theme: "shahid_minar_dawn",
      animation_trigger: "bounce_idle",
    },
  },
  content: {
    instruction_text: "চলো ভাইয়ার সাথে সমাধান করি!",
    interactive_script: "এক ধাপ করে ভাবো!",
    challenge: {
      question_type: "multiple_choice",
      question_body: "১২ + ৯ = ?",
      options: ["২০", "২১", "২২"],
      correct_answer_index: 1,
      socratic_hint: "১২ + ৮ = ২০, তাহলে +১?",
    },
  },
  gamification: {
    xp_reward: 20,
    streak_multiplier: 1.2,
    feedback_message: { on_success: "শাবাশ! 🌟", on_failure: "আবার দেখো 👀" },
  },
};

describe("canonical bridge (TDD)", () => {
  it("converts legacy engine payloads to the Section 4.1 contract", () => {
    const c: EdTechContentPayload = toCanonicalPayload(LEGACY_FIXTURE);
    expect(c.moduleMetadata.academicTopic).toBe("nctb_math_class3_addition");
    expect(c.uiComponent.type).toBe("gamified_quiz");
    expect(c.uiComponent.renderingProps.avatarIdentifier).toBe("apu_mentor");
    expect(c.payloadContent.challengeBlock?.type).toBe("mcq");
    expect(c.payloadContent.challengeBlock?.correctChoiceIndex).toBe(1);
    expect(c.gamificationMetrics.baseXpAllocated).toBe(20);
  });

  it("round-trips stable fields through both adapters", () => {
    const back = toLegacyEnginePayload(toCanonicalPayload(LEGACY_FIXTURE));
    expect(back.module_metadata.topic).toBe(LEGACY_FIXTURE.module_metadata.topic);
    expect(back.ui_component.type).toBe("quiz_screen");
    expect(back.content.challenge?.correct_answer_index).toBe(1);
    expect(back.gamification.xp_reward).toBe(20);
  });

  it("handles payloads without a challenge block", () => {
    const { challenge: _drop, ...content } = LEGACY_FIXTURE.content;
    void _drop;
    const c = toCanonicalPayload({ ...LEGACY_FIXTURE, content });
    expect(c.payloadContent.challengeBlock).toBeUndefined();
  });
});
