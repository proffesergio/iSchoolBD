import { describe, it, expect, beforeEach } from "vitest";
import {
  DISCOVERY_XP,
  LISTENS_TO_UNLOCK,
  mergePersisted,
  parseLearner,
  serializeLearner,
  useLearnerStore,
} from "./store";

beforeEach(() => {
  useLearnerStore.getState().reset();
});

describe("learn-first unlock loop (TDD)", () => {
  it("locks শব্দ/খেলা until enough spell-only listens", () => {
    expect(useLearnerStore.getState().isTestUnlocked("ক")).toBe(false);
    for (let i = 0; i < LISTENS_TO_UNLOCK - 1; i++) {
      useLearnerStore.getState().recordListen("ক");
    }
    expect(useLearnerStore.getState().isTestUnlocked("ক")).toBe(false);
    useLearnerStore.getState().recordListen("ক");
    expect(useLearnerStore.getState().isTestUnlocked("ক")).toBe(true);
  });

  it("awards discovery XP only on the first listen per letter", () => {
    useLearnerStore.getState().recordListen("ক");
    expect(useLearnerStore.getState().xp).toBe(DISCOVERY_XP);
    useLearnerStore.getState().recordListen("ক");
    expect(useLearnerStore.getState().xp).toBe(DISCOVERY_XP);
    useLearnerStore.getState().recordListen("খ");
    expect(useLearnerStore.getState().xp).toBe(DISCOVERY_XP * 2);
  });

  it("tracks listened letters for grid ✅ + progress", () => {
    useLearnerStore.getState().recordListen("ক");
    useLearnerStore.getState().recordListen("খ");
    expect(useLearnerStore.getState().listenedLetters).toContain("ক");
    expect(useLearnerStore.getState().progressPercentage(15)).toBe(
      Math.round((2 / 15) * 100)
    );
  });
});

describe("persistence (TDD)", () => {
  it("round-trips through JSON", () => {
    const s = {
      xp: 12,
      streakDays: 3,
      seenTopics: ["sworoborna_ক"],
      listenedLetters: ["ক"],
      listenCounts: { "ক": 2 },
      currentTier: "tier_2" as const,
    };
    expect(parseLearner(serializeLearner(s))).toEqual(s);
  });

  it("rejects garbage safely", () => {
    expect(parseLearner(null)).toEqual({});
    expect(parseLearner("not json")).toEqual({});
    expect(parseLearner("[1,2]")).toEqual({});
    expect(
      parseLearner(
        JSON.stringify({
          xp: -5,
          streakDays: 0,
          seenTopics: "nope",
          listenCounts: { a: -2, b: "z" },
          currentTier: "tier_9",
        })
      )
    ).toEqual({ listenCounts: {} });
  });

  it("merges persisted values over the base", () => {
    const m = mergePersisted(
      {
        xp: 0,
        streakDays: 1,
        seenTopics: [],
        listenedLetters: [],
        listenCounts: {},
        currentTier: "tier_1" as const,
      },
      { xp: 7, listenedLetters: ["খ"] }
    );
    expect(m.xp).toBe(7);
    expect(m.listenedLetters).toEqual(["খ"]);
    expect(m.streakDays).toBe(1);
  });

  it("hydrate() flips the hydrated flag without crashing", () => {
    useLearnerStore.getState().hydrate();
    expect(useLearnerStore.getState().hydrated).toBe(true);
  });
});
