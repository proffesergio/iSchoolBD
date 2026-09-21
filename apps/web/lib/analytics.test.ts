import { describe, it, expect } from "vitest";
import { levelFor, summarize, topicLabel, XP_PER_LEVEL } from "./analytics";
import type { ProgressEntry } from "./admin-client";

function entry(partial: Partial<ProgressEntry> & { updated_at: string }): ProgressEntry {
  return {
    user_id: "s1", topic: "counting", xp: 10,
    progress_percentage: 50, streak_days: 1, ...partial,
  };
}

describe("student analytics", () => {
  it("levels every 100 XP", () => {
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(99).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(250)).toEqual(
      expect.objectContaining({ level: 3, xpIntoLevel: 50, xpForNext: 50, levelProgress: 50 })
    );
    expect(XP_PER_LEVEL).toBe(100);
  });

  it("rolls up totals, topics, streak", () => {
    const s = summarize([
      entry({ topic: "counting", xp: 10, streak_days: 2, updated_at: new Date().toISOString() }),
      entry({ topic: "vowels", xp: 25, streak_days: 3, updated_at: new Date().toISOString() }),
    ]);
    expect(s.totalXp).toBe(35);
    expect(s.topicsCompleted).toBe(2);
    expect(s.streakDays).toBe(3);
    expect(s.perTopic[0].topic).toBe("vowels");
  });

  it("buckets XP into last-7-day bars", () => {
    const now = new Date(2026, 8, 21, 12, 0, 0);
    const iso = (d: Date) => d.toISOString();
    const s = summarize([
      entry({ xp: 10, updated_at: iso(new Date(2026, 8, 21, 9, 0, 0)) }),
      entry({ xp: 5, updated_at: iso(new Date(2026, 8, 19, 9, 0, 0)) }),
      entry({ xp: 99, updated_at: iso(new Date(2026, 7, 1)) }),
    ], now);
    expect(s.weeklyXp[6]).toBe(10);
    expect(s.weeklyXp[4]).toBe(5);
    expect(s.totalXp).toBe(114);
  });

  it("ignores negative xp and bad dates", () => {
    const s = summarize([entry({ xp: -5, updated_at: "garbage" })]);
    expect(s.totalXp).toBe(0);
    expect(s.weeklyXp).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("humanizes topic labels", () => {
    expect(topicLabel("sworoborna_ক")).toBe("ক");
    expect(topicLabel("jog_12_9")).toBe("jog 12 9");
  });
});
