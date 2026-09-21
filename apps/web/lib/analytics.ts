import type { ProgressEntry } from "./admin-client";

/**
 * Student-dashboard analytics: turns raw progress entries into
 * gamified display numbers (level, ring %, weekly bars, subject split).
 * Pure functions — tested, reused by /dashboard and /admin stats cards.
 */

export interface DashboardStats {
  totalXp: number;
  level: number;
  levelProgress: number; // 0-100 within current level
  xpIntoLevel: number;
  xpForNext: number;
  topicsCompleted: number;
  streakDays: number;
  weeklyXp: number[]; // last 7 days, oldest → today
  perTopic: { topic: string; xp: number }[];
}

export const XP_PER_LEVEL = 100;

export function levelFor(xp: number): { level: number; xpIntoLevel: number; xpForNext: number; levelProgress: number } {
  const safe = Math.max(0, Math.floor(xp));
  const level = Math.floor(safe / XP_PER_LEVEL) + 1;
  const xpIntoLevel = safe % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpForNext: XP_PER_LEVEL - xpIntoLevel, levelProgress: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100) };
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function summarize(entries: ProgressEntry[], now = new Date()): DashboardStats {
  const totalXp = entries.reduce((n, e) => n + Math.max(0, e.xp ?? 0), 0);
  const topics = new Map<string, number>();
  for (const e of entries) topics.set(e.topic, (topics.get(e.topic) ?? 0) + Math.max(0, e.xp ?? 0));
  const streakDays = entries.reduce((n, e) => Math.max(n, e.streak_days ?? 0), 0);

  const buckets = new Array<number>(7).fill(0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  entries.forEach((e) => {
    const t = new Date(e.updated_at);
    if (Number.isNaN(t.getTime())) return;
    const day = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const diff = Math.round((today.getTime() - day.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) buckets[6 - diff] += Math.max(0, e.xp ?? 0);
  });

  return {
    totalXp,
    ...levelFor(totalXp),
    topicsCompleted: topics.size,
    streakDays,
    weeklyXp: buckets,
    perTopic: [...topics.entries()]
      .map(([topic, xp]) => ({ topic, xp }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 8),
  };
}

/** Topic ids look like "sworoborna_ক" or "counting" — humanize for charts. */
export function topicLabel(topic: string): string {
  return topic.replace(/^sworoborna_/, "").replace(/_/g, " ");
}

export { dayKey };
