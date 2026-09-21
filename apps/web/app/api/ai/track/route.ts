import { z } from "zod";
import { getTrack } from "../../../../lib/tracks";
import { EdTechPayloadSchema } from "../../../../lib/ai-schema";

export const runtime = "edge";

const TrackRequestSchema = z.object({
  trackId: z.string().min(1).max(80),
  lessonId: z.string().min(1).max(80).optional(),
});

/**
 * POST /api/ai/track — server-side source of truth for Tier 2/3 lessons.
 * Looks up the validated track registry and returns the exact Section 4.1
 * canonical payload, so thin clients (PWA, future mobile shell) never
 * hardcode lesson content.
 */
export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = TrackRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const track = getTrack(parsed.data.trackId);
  if (!track) {
    return Response.json({ error: `Unknown track: ${parsed.data.trackId}` }, { status: 404 });
  }
  const lesson =
    (parsed.data.lessonId
      ? track.lessons.find((l) => l.id === parsed.data.lessonId)
      : track.lessons[0]) ?? track.lessons[0];
  if (!lesson) {
    return Response.json({ error: `Track ${track.id} has no lessons` }, { status: 404 });
  }

  const payload = {
    moduleMetadata: {
      tier: track.tier,
      academicTopic: `${track.id}:${lesson.topic}`,
      progressPercentage: 20,
    },
    uiComponent: {
      type: track.tier === "tier_2" ? "gamified_quiz" : "socratic_hint",
      renderingProps: {
        avatarIdentifier: track.mascot,
        visualTheme: track.theme,
        onScreenAnimation: "pulse_active",
      },
    },
    payloadContent: {
      displayInstruction: lesson.instruction,
      audioScriptText: lesson.audioScript ?? track.coachLine,
      challengeBlock: {
        type: "mcq",
        prompt: lesson.prompt,
        choices: lesson.choices,
        correctChoiceIndex: lesson.correctChoiceIndex,
        socraticHintProgression: lesson.hints,
      },
    },
    gamificationMetrics: {
      baseXpAllocated: track.baseXp,
      streakMultiplierAwarded: track.streak,
      feedbackVariants: {
        onSuccessMessage: lesson.onSuccess,
        onFailureMessage: lesson.onFailure,
      },
    },
  };

  const out = EdTechPayloadSchema.safeParse(payload);
  if (!out.success) {
    return Response.json({ error: "Engine contract violation" }, { status: 500 });
  }
  return Response.json(out.data, { status: 200 });
}
