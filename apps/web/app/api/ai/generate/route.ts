import { z } from "zod";
import type { EdTechContentPayload } from "../../../../../../types/edtech";
import { EdTechPayloadSchema } from "../../../../lib/ai-schema";

export const runtime = "edge";

// ---- Ingress validation (Zod preferred, Edge-compatible, no native modules) ----
const GenerateRequestSchema = z.object({
  tier: z.enum(["tier_1", "tier_2", "tier_3"]),
  academicTopic: z.string().min(1).max(120),
  progressPercentage: z.number().int().min(0).max(100).default(10),
});

type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// ---- Egress validation: shared Section 4.1 contract (see lib/ai-schema.ts) ----

function buildPayload(req: GenerateRequest): EdTechContentPayload {
  if (req.tier === "tier_1") {
    return {
      moduleMetadata: { ...req },
      uiComponent: {
        type: "talking_letter",
        renderingProps: {
          avatarIdentifier: "kakoli_crow",
          visualTheme: "sundarbans_green",
          onScreenAnimation: "bounce_idle",
        },
      },
      payloadContent: {
        displayInstruction: `ক চাপ দাও! কাক দেখো 🐦‍⬛ — ${req.academicTopic}`,
        audioScriptText: "কা কা! আমি ক! কাকে ক! বলো — ক!",
        challengeBlock: {
          type: "phonetic_tap",
          prompt: "ক দিয়ে কোন শব্দ? শুনে বাছো!",
          choices: ["কাক", "আম", "গরু", "চাঁদ"],
          correctChoiceIndex: 0,
          socraticHintProgression: [
            "প্রথম আওয়াজ ক! ঠোঁট কেমন করে?",
            "কাক ডাকে কা কা — মনে করো Sundarbans-এর কাক!",
          ],
        },
      },
      gamificationMetrics: {
        baseXpAllocated: 10,
        streakMultiplierAwarded: 1.0,
        feedbackVariants: {
          onSuccessMessage: "শাবাশ! 🎉",
          onFailureMessage: "আবার চেষ্টা করো! 💪",
        },
      },
    };
  }

  if (req.tier === "tier_2") {
    return {
      moduleMetadata: { ...req },
      uiComponent: {
        type: "gamified_quiz",
        renderingProps: {
          avatarIdentifier: "apu_mentor",
          visualTheme: "shahid_minar_dawn",
          onScreenAnimation: "pulse_active",
        },
      },
      payloadContent: {
        displayInstruction: "চলো ভাইয়ার সাথে ধাপে ধাপে সমাধান করি! 💪",
        audioScriptText: "ভয় নেই, Apu সাথে আছে — এক ধাপ করে ভাবো!",
        challengeBlock: {
          type: "mcq",
          prompt: "Anika-র কাছে ৳১২ ছিল, Fahim দিল আরও ৳৯। Pohela Boishakh মেলায় মোট কত? 🍒",
          choices: ["৳২০", "৳২১", "৳২২", "৳১৯"],
          correctChoiceIndex: 1,
          socraticHintProgression: [
            "১২ + ৮ = ২০, তাহলে +১ কত?",
            "Cox's Bazar ঝিনুক গুনার মতো এক এক করে যোগ করো!",
          ],
        },
      },
      gamificationMetrics: {
        baseXpAllocated: 20,
        streakMultiplierAwarded: 1.2,
        feedbackVariants: {
          onSuccessMessage: "শাবাশ, গণিতবিদ! 🌟",
          onFailureMessage: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
        },
      },
    };
  }

  return {
    moduleMetadata: { ...req },
    uiComponent: {
      type: "socratic_hint",
      renderingProps: {
        avatarIdentifier: "tech_coach_robo",
        visualTheme: "hilsha_river_blue",
        onScreenAnimation: "pulse_active",
      },
    },
    payloadContent: {
      displayInstruction: "Straight মুখস্থ না — derive করি! Sundarbans ট্রলার edition 🛶",
      audioScriptText: "s = vt মনে আছে? v=10, t=5 — তাহলে s=?",
      challengeBlock: {
        type: "fill_blank",
        prompt: "s = v × t = 10 × 5 = ___ m",
        choices: ["15", "50", "2", "105"],
        correctChoiceIndex: 1,
        socraticHintProgression: [
          "গুণটা ভাঙো: 10×5 = 10+10+10+10+10",
          "Board exam trick: unit check করো — m/s × s = m, so 50 m",
        ],
      },
    },
    gamificationMetrics: {
      baseXpAllocated: 30,
      streakMultiplierAwarded: 1.5,
      feedbackVariants: {
        onSuccessMessage: "Boom! Physics sorted 🔥",
        onFailureMessage: "Almost there! Formula-টা আবার check করো",
      },
    },
  };
}

export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GenerateRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = buildPayload(parsed.data);
  const out = EdTechPayloadSchema.safeParse(payload);
  if (!out.success) {
    return Response.json({ error: "Engine contract violation" }, { status: 500 });
  }
  return Response.json(out.data, { status: 200 });
}
