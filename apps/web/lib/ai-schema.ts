import { z } from "zod";

/**
 * Shared Section 4.1 egress contract for all AI routes.
 * Lives in lib/ (NOT in a route.ts) because Next.js constrains
 * route-module exports to handlers + route config only.
 */
export const EdTechPayloadSchema = z.object({
  moduleMetadata: z.object({
    tier: z.enum(["tier_1", "tier_2", "tier_3"]),
    academicTopic: z.string().min(1),
    progressPercentage: z.number().int().min(0).max(100),
  }),
  uiComponent: z.object({
    type: z.enum(["talking_letter", "gamified_quiz", "socratic_hint", "admin_stat_panel"]),
    renderingProps: z.object({
      avatarIdentifier: z.string().min(1),
      visualTheme: z.string().min(1),
      onScreenAnimation: z.enum([
        "success_sparkle",
        "shake_error",
        "bounce_idle",
        "pulse_active",
      ]),
    }),
  }),
  payloadContent: z.object({
    displayInstruction: z.string().min(1),
    audioScriptText: z.string().optional(),
    challengeBlock: z
      .object({
        type: z.enum(["mcq", "rearrange", "phonetic_tap", "fill_blank"]),
        prompt: z.string().min(1),
        choices: z.array(z.string()).min(2).max(6),
        correctChoiceIndex: z.number().int().min(0).max(5),
        socraticHintProgression: z.array(z.string()).min(1),
      })
      .optional(),
  }),
  gamificationMetrics: z.object({
    baseXpAllocated: z.number().int().min(0).max(500),
    streakMultiplierAwarded: z.number().min(1.0).max(5.0),
    feedbackVariants: z.object({
      onSuccessMessage: z.string().min(1),
      onFailureMessage: z.string().min(1),
    }),
  }),
});

export type EdTechPayload = z.infer<typeof EdTechPayloadSchema>;
