import { describe, it, expect } from "vitest";
import {
  completedToday,
  loadProgress,
  recordChapter,
  todayKey,
} from "./chapter-progress";
import { BADGES, earnedBadges } from "./badges";

describe("chapter progress", () => {
  it("records attempts, keeps best, sums xp", () => {
    let p = recordChapter({}, "c1", 2, 4, 20, new Date(2026, 0, 5));
    expect(p.c1.done).toBe(true);
    expect(p.c1.best).toBe(0.5);
    p = recordChapter(p, "c1", 4, 4, 40, new Date(2026, 0, 6));
    expect(p.c1.attempts).toBe(2);
    expect(p.c1.best).toBe(1);
    expect(p.c1.xp).toBe(60);
  });

  it("loads nothing without storage", () => {
    expect(loadProgress()).toEqual({});
  });

  it("finds today's completions", () => {
    const now = new Date(2026, 2, 10, 12);
    let p = recordChapter({}, "a", 1, 1, 10, now);
    p = recordChapter(p, "b", 1, 1, 10, new Date(2026, 2, 9));
    expect(completedToday(p, now)).toEqual(["a"]);
    expect(todayKey(now)).toBe(todayKey(new Date(2026, 2, 10, 23)));
  });
});

describe("badges", () => {
  it("has a 6-badge cabinet", () => {
    expect(BADGES).toHaveLength(6);
  });

  it("unlocks by progress and streak", () => {
    let p = recordChapter({}, "a", 4, 4, 10);
    expect(earnedBadges(p, 1)).toEqual(["first-step", "perfect"]);
    for (const id of ["b", "c", "d", "e"]) p = recordChapter(p, id, 1, 2, 5);
    expect(earnedBadges(p, 3)).toContain("scholar-5");
    expect(earnedBadges(p, 3)).toContain("streak-3");
    expect(earnedBadges(p, 7)).toContain("streak-7");
    expect(earnedBadges({}, 0)).toEqual([]);
  });
});
