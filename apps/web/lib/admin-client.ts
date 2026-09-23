/**
 * Typed client for the admin control plane + public catalog/summary reads.
 * Browser-only key handling (sessionStorage) lives in app/admin/page.tsx;
 * this module stays pure fetch so it is unit-testable.
 */

import type { Checkpoint } from "./video-sources";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

/** Shown in the admin unlock screen so a wrong base URL is visible instantly. */
export const API_BASE = BASE;

export interface AdminLessonInput {
  id: string;
  chapterId: string;
  titleBn: string;
  titleEn: string;
  kind: "interactive" | "video" | "quiz";
  refId?: string;
  xp?: number;
  audioUrl?: string;
  audioText?: string;
}

export interface AdminLectureInput {
  id: string;
  title: string;
  provider: "youtube" | "google-drive" | "terabox" | "direct";
  sourceUrl: string;
  courseId?: string;
  sectionId?: string;
  sectionTitle?: string;
  directUrl?: string;
  durationSec?: number;
  checkpoints?: Checkpoint[];
}

export interface AdminVideoCourseInput {
  id: string;
  titleBn: string;
  titleEn: string;
  classId?: string;
  subject?: string;
}

export interface StudentRow {
  user_id: string;
  totalXp: number;
  topicsCompleted: number;
  streakDays: number;
  lastActive: string | null;
}

export interface AdminStats {
  students: number;
  progressEvents: number;
  totalXp: number;
  catalog: { courses: number; chapters: number; lessons: number; videoCourses: number; lectures: number };
  topTopics: { topic: string; events: number }[];
}

export interface ProgressEntry {
  user_id: string;
  topic: string;
  xp: number;
  progress_percentage: number;
  streak_days: number;
  updated_at: string;
}

export interface ProgressSummary {
  user_id: string;
  totalXp: number;
  topicsCompleted: number;
  streakDays: number;
  lastActive: string | null;
  entries: ProgressEntry[];
}

async function req<T>(path: string, adminKey?: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`API ${r.status} ${path}: ${body.slice(0, 200)}`);
  }
  return (await r.json()) as T;
}

export const adminApi = {  upsertLesson: (key: string, input: AdminLessonInput) =>
    req("/admin/lessons", key, { method: "PUT", body: JSON.stringify(input) }),
  deleteLesson: (key: string, id: string) =>
    req<{ deleted: string }>(`/admin/lessons/${encodeURIComponent(id)}`, key, { method: "DELETE" }),
  upsertCourse: (key: string, input: { id: string; classId: string; subject: string; titleBn: string; titleEn: string }) =>
    req("/admin/courses", key, { method: "PUT", body: JSON.stringify(input) }),
  upsertChapter: (key: string, input: { id: string; courseId: string; titleBn: string; titleEn: string }) =>
    req("/admin/chapters", key, { method: "PUT", body: JSON.stringify(input) }),
  upsertVideoCourse: (key: string, input: AdminVideoCourseInput) =>
    req("/admin/video-courses", key, { method: "PUT", body: JSON.stringify(input) }),
  upsertSection: (key: string, input: { id: string; courseId: string; title: string }) =>
    req("/admin/sections", key, { method: "PUT", body: JSON.stringify(input) }),
  deleteSection: (key: string, id: string) =>
    req<{ deleted: string; lecturesRemoved: number }>(`/admin/sections/${encodeURIComponent(id)}`, key, { method: "DELETE" }),
  upsertCustomBook: (key: string, input: { id: string; classId: string; titleBn: string; titleEn: string; driveFileId: string; note?: string }) =>
    req("/admin/custom-books", key, { method: "PUT", body: JSON.stringify(input) }),
  deleteCustomBook: (key: string, id: string) =>
    req<{ deleted: string }>(`/admin/custom-books/${encodeURIComponent(id)}`, key, { method: "DELETE" }),
  upsertLecture: (key: string, input: AdminLectureInput) =>
    req("/admin/lectures", key, { method: "PUT", body: JSON.stringify(input) }),
  deleteLecture: (key: string, id: string) =>
    req<{ deleted: string }>(`/admin/lectures/${encodeURIComponent(id)}`, key, { method: "DELETE" }),
  students: (key: string) => req<StudentRow[]>("/admin/students", key),
  stats: (key: string) => req<AdminStats>("/admin/stats", key),
};

export interface CourseTree {
  id: string;
  classId: string;
  subject: string;
  titleBn: string;
  titleEn: string;
  chapters: { id: string; courseId: string; titleBn: string; titleEn: string; lessons: AdminLessonInput[] }[];
}

export interface VideoCourseTree {
  id: string;
  titleBn: string;
  titleEn: string;
  classId?: string;
  subject?: string;
  sections: { id: string; courseId: string; title: string; lectures: AdminLectureInput[] }[];
}

export interface CustomBookRow {
  id: string;
  classId: string;
  titleBn: string;
  titleEn: string;
  driveFileId: string;
  note?: string;
}

export const publicApi = {
  health: () => req<{ status: string }>("/health"),
  customBooks: () => req<CustomBookRow[]>("/catalog/custom-books"),
  courses: () => req<{ id: string; classId: string; subject: string; titleBn: string; titleEn: string }[]>("/catalog/courses"),
  courseTree: (id: string) => req<CourseTree>(`/catalog/courses/${encodeURIComponent(id)}`),
  videoCourses: () => req<{ id: string; titleBn: string; titleEn: string; lectureCount: number }[]>("/catalog/video-courses"),
  videoCourseTree: (id: string) => req<VideoCourseTree>(`/catalog/video-courses/${encodeURIComponent(id)}`),
  summary: (userId: string) =>
    req<ProgressSummary>(`/progress/summary?user_id=${encodeURIComponent(userId)}`),
};
