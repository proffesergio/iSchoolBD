import { describe, it, expect } from "vitest";
import {
  TOTAL_TRACK_LESSONS,
  TRACKS,
  getTrack,
  hintLeaksAnswer,
  validateTrack,
} from "./tracks";

describe("track registry (TDD)", () => {
  it("ships one track per tier with real lesson counts", () => {
    expect(TRACKS.length).toBe(6);
    expect(getTrack("math-3-addition")?.lessons.length).toBe(8);
    expect(getTrack("phy-9-motion")?.lessons.length).toBe(5);
    expect(getTrack("nctb-1-bn-path")?.lessons.length).toBe(9);
    expect(TOTAL_TRACK_LESSONS).toBe(8 + 5 + 3 + 3 + 3 + 9);
  });

  it("validates every track: schema ranges + hints never leak answers", () => {
    for (const t of TRACKS) {
      expect(validateTrack(t), t.id).toEqual([]);
    }
  });

  it("detects a leaking hint (whole-token match, bn digits normalized)", () => {
    expect(hintLeaksAnswer("উত্তর ৪২", "৪২")).toBe(true);
    expect(hintLeaksAnswer("The answer is 42", "42")).toBe(true);
    expect(hintLeaksAnswer("১২+৮=২০, আর ১ কত?", "২১")).toBe(false);
    expect(hintLeaksAnswer("120 ÷ 60", "2")).toBe(false);
  });

  it("rejects malformed lessons", () => {
    const bad = {
      id: "bad",
      subject: "math",
      tier: "tier_2",
      titleBn: "x",
      titleEn: "x",
      cover: "x",
      mascot: "x",
      theme: "x",
      coachLine: "x",
      baseXp: 20,
      streak: 1.2,
      lessons: [
        {
          id: "b1", topic: "t", instruction: "i", prompt: "p",
          choices: ["a"], correctChoiceIndex: 5, hints: [],
          onSuccess: "s", onFailure: "f",
        },
      ],
    };
    const issues = validateTrack(
      bad as unknown as Parameters<typeof validateTrack>[0]
    );
    expect(issues.length).toBeGreaterThanOrEqual(3);
  });
});
