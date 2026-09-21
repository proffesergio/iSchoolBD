"use client";
import { create } from "zustand";
import type { TierId } from "../../../types/edtech";

/** Spell-only listens required before the quiz unlocks for a letter. */
export const LISTENS_TO_UNLOCK = 2;
/** Discovery XP for a first listen; quiz XP comes from the payload. */
export const DISCOVERY_XP = 1;
/** Tracing pass mark (guide coverage %). */
export const TRACE_PASS_SCORE = 60;
/** localStorage key — bump to invalidate old shapes. */
export const STORAGE_KEY = "ischool-learner-v1";

interface LearnerState {
  xp: number;
  streakDays: number;
  seenTopics: string[];
  listenedLetters: string[];
  listenCounts: Record<string, number>;
  currentTier: TierId;
  lastFeedback: "idle" | "success_sparkle" | "shake_error";
  hydrated: boolean;
  addXp: (reward: number, multiplier: number) => void;
  markSeen: (topicId: string) => void;
  recordListen: (letter: string) => number;
  listenCount: (letter: string) => number;
  isTestUnlocked: (letter: string) => boolean;
  setFeedback: (f: LearnerState["lastFeedback"]) => void;
  setTier: (t: TierId) => void;
  reset: () => void;
  hydrate: () => void;
  progressPercentage: (total: number) => number;
}

export interface PersistedLearner {
  xp: number;
  streakDays: number;
  seenTopics: string[];
  listenedLetters: string[];
  listenCounts: Record<string, number>;
  currentTier: TierId;
}

function defaults(): PersistedLearner {
  return {
    xp: 0,
    streakDays: 1,
    seenTopics: [],
    listenedLetters: [],
    listenCounts: {},
    currentTier: "tier_1",
  };
}

export function serializeLearner(s: PersistedLearner): string {
  return JSON.stringify(s);
}

/** Forgiving loader: garbage in → {} out, never throws, clamps negatives. */
export function parseLearner(raw: string | null | undefined): Partial<PersistedLearner> {
  if (!raw) return {};
  try {
    const o: unknown = JSON.parse(raw);
    if (!o || typeof o !== "object") return {};
    const r = o as Record<string, unknown>;
    const out: Partial<PersistedLearner> = {};
    if (typeof r.xp === "number" && r.xp >= 0 && Number.isFinite(r.xp)) {
      out.xp = Math.floor(r.xp);
    }
    if (typeof r.streakDays === "number" && r.streakDays >= 1 && Number.isFinite(r.streakDays)) {
      out.streakDays = Math.floor(r.streakDays);
    }
    if (Array.isArray(r.seenTopics)) {
      out.seenTopics = r.seenTopics.filter((t): t is string => typeof t === "string");
    }
    if (Array.isArray(r.listenedLetters)) {
      out.listenedLetters = r.listenedLetters.filter((t): t is string => typeof t === "string");
    }
    if (r.listenCounts && typeof r.listenCounts === "object") {
      const c: Record<string, number> = {};
      for (const [k, v] of Object.entries(r.listenCounts as Record<string, unknown>)) {
        if (typeof v === "number" && v > 0 && Number.isFinite(v)) c[k] = Math.floor(v);
      }
      out.listenCounts = c;
    }
    if (r.currentTier === "tier_1" || r.currentTier === "tier_2" || r.currentTier === "tier_3") {
      out.currentTier = r.currentTier;
    }
    return out;
  } catch {
    return {};
  }
}

/** Pure merge — persisted values win, everything else stays. Tested. */
export function mergePersisted(
  base: PersistedLearner,
  p: Partial<PersistedLearner>
): PersistedLearner {
  return {
    xp: p.xp ?? base.xp,
    streakDays: p.streakDays ?? base.streakDays,
    seenTopics: p.seenTopics ?? base.seenTopics,
    listenedLetters: p.listenedLetters ?? base.listenedLetters,
    listenCounts: p.listenCounts ?? base.listenCounts,
    currentTier: p.currentTier ?? base.currentTier,
  };
}

function readStorage(): Partial<PersistedLearner> {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return {};
    return parseLearner(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
}

function writeStorage(s: PersistedLearner): void {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return;
    window.localStorage.setItem(STORAGE_KEY, serializeLearner(s));
  } catch {
    // private mode / quota — app keeps running in-memory
  }
}

export const useLearnerStore = create<LearnerState>()((set, get) => ({
  ...defaults(),
  lastFeedback: "idle",
  hydrated: false,
  addXp: (reward, multiplier) =>
    set((s) => ({ xp: s.xp + Math.round(reward * multiplier) })),
  markSeen: (topicId) =>
    set((s) =>
      s.seenTopics.includes(topicId)
        ? s
        : { seenTopics: [...s.seenTopics, topicId] }
    ),
  recordListen: (letter) => {
    const prev = get().listenCounts[letter] ?? 0;
    const next = prev + 1;
    set((s) => ({
      listenCounts: { ...s.listenCounts, [letter]: next },
      listenedLetters: s.listenedLetters.includes(letter)
        ? s.listenedLetters
        : [...s.listenedLetters, letter],
      xp: s.listenedLetters.includes(letter) ? s.xp : s.xp + DISCOVERY_XP,
    }));
    return next;
  },
  listenCount: (letter) => get().listenCounts[letter] ?? 0,
  isTestUnlocked: (letter) =>
    (get().listenCounts[letter] ?? 0) >= LISTENS_TO_UNLOCK,
  setFeedback: (lastFeedback) => set({ lastFeedback }),
  setTier: (currentTier) => set({ currentTier }),
  reset: () => set({ ...defaults(), lastFeedback: "idle", hydrated: false }),
  hydrate: () => {
    const s = get();
    const merged = mergePersisted(
      {
        xp: s.xp,
        streakDays: s.streakDays,
        seenTopics: s.seenTopics,
        listenedLetters: s.listenedLetters,
        listenCounts: s.listenCounts,
        currentTier: s.currentTier,
      },
      readStorage()
    );
    set({ ...merged, hydrated: true });
  },
  progressPercentage: (total) => {
    const seen = get().listenedLetters.length;
    if (total <= 0) return 0;
    return Math.min(100, Math.round((seen / total) * 100));
  },
}));

// Persist after hydration only — never overwrite storage with SSR defaults.
if (typeof window !== "undefined") {
  useLearnerStore.subscribe((s) => {
    if (!s.hydrated) return;
    writeStorage({
      xp: s.xp,
      streakDays: s.streakDays,
      seenTopics: s.seenTopics,
      listenedLetters: s.listenedLetters,
      listenCounts: s.listenCounts,
      currentTier: s.currentTier,
    });
  });
}

export function speakBangla(text: string): void {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "bn-BD";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // no-op (SSR / tests)
  }
}

/**
 * Language-aware TTS for the talking-book pages.
 * lang is a BCP-47 tag: bn → "bn-BD", en → "en-US", ar → "ar-SA".
 */
export function speakWithLang(text: string, lang: string, rate = 0.9): void {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // no-op (SSR / tests)
  }
}

/** Queue several utterances (rhymes play-all) — cancel first, then chain. */
export function queueSpeak(texts: string[], lang: string, rate = 0.9): void {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    for (const t of texts) {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = lang;
      u.rate = rate;
      window.speechSynthesis.speak(u);
    }
  } catch {
    // no-op (SSR / tests)
  }
}

/**
 * Phase-1 TTS: spell ONLY the letter, slowly. No word, no sentence —
 * toddlers master the sound first, the word and quiz come later.
 */
export function spellLetterSound(letter: string): void {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(`${letter}!`);
    u.lang = "bn-BD";
    u.rate = 0.75;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // no-op (SSR / tests)
  }
}
