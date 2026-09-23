import { API_BASE } from "./admin-client";
import { getDeviceId } from "./device";
import { getStudentSession } from "./student-auth";

/**
 * Per-chapter completion: instant on device, synced to the progress API
 * when possible (topic `chapter:{chapterId}`). Best score kept; XP summed.
 */

export interface ChapterRecord {
  done: boolean;
  best: number; // best score/total ratio 0..1
  attempts: number;
  xp: number;
  updatedAt: string;
}

export type ChapterProgress = Record<string, ChapterRecord>;

const KEY = "ischool-chapter-progress-v1";

export function loadProgress(): ChapterProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, unknown>;
    const out: ChapterProgress = {};
    for (const [k, v] of Object.entries(o)) {
      if (!v || typeof v !== "object") continue;
      const r = v as Partial<ChapterRecord>;
      out[k] = {
        done: r.done === true,
        best: typeof r.best === "number" ? Math.min(1, Math.max(0, r.best)) : 0,
        attempts: typeof r.attempts === "number" && r.attempts > 0 ? Math.floor(r.attempts) : 0,
        xp: typeof r.xp === "number" && r.xp >= 0 ? Math.floor(r.xp) : 0,
        updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : new Date(0).toISOString(),
      };
    }
    return out;
  } catch {
    return {};
  }
}

function saveProgress(p: ChapterProgress): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch { /* private mode */ }
}

/** Persist after recordChapter (device-first; backend sync is separate). */
export function persistProgress(p: ChapterProgress): void {
  saveProgress(p);
}

export function recordChapter(
  prev: ChapterProgress,
  chapterId: string,
  score: number,
  total: number,
  xp: number,
  at = new Date()
): ChapterProgress {
  const ratio = total > 0 ? score / total : 0;
  const old = prev[chapterId];
  return {
    ...prev,
    [chapterId]: {
      done: true,
      best: Math.max(old?.best ?? 0, ratio),
      attempts: (old?.attempts ?? 0) + 1,
      xp: (old?.xp ?? 0) + Math.max(0, Math.floor(xp)),
      updatedAt: at.toISOString(),
    },
  };
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Chapters completed today (for the daily mission). */
export function completedToday(p: ChapterProgress, now = new Date()): string[] {
  const tk = todayKey(now);
  return Object.entries(p)
    .filter(([, r]) => r.done && todayKey(new Date(r.updatedAt)) === tk)
    .map(([id]) => id);
}

export function currentUserId(): string {
  try {
    return getStudentSession()?.studentId || getDeviceId();
  } catch {
    return "guest";
  }
}

/** Best-effort backend sync; false when offline/failed (device copy stays). */
export async function syncChapter(
  userId: string,
  chapterId: string,
  score: number,
  total: number,
  xp: number
): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        topic: `chapter:${chapterId}`,
        xp: Math.max(0, Math.floor(xp)),
        progress_percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
