import type { ChapterProgress } from "./chapter-progress";

/**
 * Badge cabinet: earned from chapter progress + streak days.
 * Pure rules — displayed on /courses and /dashboard.
 */

export interface Badge {
  id: string;
  emoji: string;
  bn: string;
  en: string;
}

export const BADGES: Badge[] = [
  { id: "first-step", emoji: "👣", bn: "প্রথম পদক্ষেপ", en: "Finish 1 chapter" },
  { id: "scholar-5", emoji: "📚", bn: "পাঠক", en: "Finish 5 chapters" },
  { id: "scholar-15", emoji: "🎓", bn: "পণ্ডিত", en: "Finish 15 chapters" },
  { id: "perfect", emoji: "💯", bn: "নিখুঁত", en: "100% in any exam" },
  { id: "streak-3", emoji: "🔥", bn: "৩ দিনের ধারা", en: "3-day streak" },
  { id: "streak-7", emoji: "🚀", bn: "৭ দিনের ধারা", en: "7-day streak" },
];

export function earnedBadges(p: ChapterProgress, streakDays: number): string[] {
  const done = Object.values(p).filter((r) => r.done).length;
  const perfect = Object.values(p).some((r) => r.done && r.best >= 1);
  const out: string[] = [];
  if (done >= 1) out.push("first-step");
  if (done >= 5) out.push("scholar-5");
  if (done >= 15) out.push("scholar-15");
  if (perfect) out.push("perfect");
  if (streakDays >= 3) out.push("streak-3");
  if (streakDays >= 7) out.push("streak-7");
  return out;
}
