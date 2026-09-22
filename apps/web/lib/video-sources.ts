/**
 * Unified video-source model — YouTube + Google Drive + Terabox + direct.
 *
 * One `VideoRef` per lecture no matter the origin, so the Udemy-style
 * player and course catalog never branch on provider quirks:
 *
 *  YouTube:      playlist/watch/embed URLs → privacy-enhanced embed.
 *  Google Drive: /file/d/<id> share links → preview embed + direct
 *                download fallback (uc?export=download).
 *  Terabox:      /s/<token> share links. No official embed API, so we
 *                store the share URL and play the user-resolved direct
 *                file URL when a teacher attaches one; otherwise the
 *                player shows an "open in Terabox" action.
 *  Direct:       mp4/webm URLs play natively with full controls.
 */

export type VideoProvider = "youtube" | "google-drive" | "terabox" | "direct";

export interface VideoRef {
  provider: VideoProvider;
  /** canonical watch/share URL as pasted by the teacher */
  sourceUrl: string;
  /** provider id: YouTube video id, Drive file id, Terabox token, or full URL */
  sourceId: string;
  /** optional teacher-attached direct file URL (Terabox resolution, Drive export) */
  directUrl?: string;
}

export interface Lecture {
  id: string;
  title: string;
  durationSec?: number;
  video: VideoRef;
  /** in-video micro-assessment check-ins (VID-2), sorted by atSec */
  checkpoints?: Checkpoint[];
}

export interface Checkpoint {
  atSec: number;
  prompt: string;
  choices: string[];
  correctChoiceIndex: number;
  xp?: number;
}

/** Validate teacher-authored checkpoints. Returns issue strings. */
export function validateCheckpoints(checkpoints: Checkpoint[] | undefined): string[] {
  if (!checkpoints) return [];
  const issues: string[] = [];
  if (checkpoints.length > 10) issues.push("at most 10 checkpoints per lecture");
  checkpoints.forEach((c, i) => {
    const tag = `checkpoint[${i}]`;
    if (!Number.isFinite(c.atSec) || c.atSec < 0 || c.atSec > 24 * 3600) issues.push(`${tag}: bad atSec`);
    if (!c.prompt?.trim()) issues.push(`${tag}: missing prompt`);
    if (!Array.isArray(c.choices) || c.choices.length < 2 || c.choices.length > 4) {
      issues.push(`${tag}: choices must be 2-4`);
    }
    if (!Number.isInteger(c.correctChoiceIndex) || c.correctChoiceIndex < 0 || c.correctChoiceIndex >= (c.choices?.length ?? 0)) {
      issues.push(`${tag}: correctChoiceIndex out of range`);
    }
    const xp = c.xp ?? 5;
    if (!Number.isInteger(xp) || xp < 0 || xp > 500) issues.push(`${tag}: xp out of range`);
  });
  return issues;
}

export interface CourseSection {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface VideoCourse {
  id: string;
  titleBn: string;
  titleEn: string;
  classId?: string;
  subject?: string;
  sections: CourseSection[];
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

export function parseVideoLink(url: string): VideoRef | null {
  const raw = url.trim();
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase();

  // ---- YouTube: watch?v=, youtu.be/, /embed/, /shorts/, playlist → video ----
  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    const v =
      u.searchParams.get("v") ??
      (host.includes("youtu.be") ? u.pathname.slice(1).split("/")[0] : null) ??
      (u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : null) ??
      (u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : null);
    if (v && YT_ID.test(v)) {
      return { provider: "youtube", sourceUrl: raw, sourceId: v };
    }
    return null;
  }

  // ---- Google Drive: /file/d/<id> ----
  if (host.includes("drive.google.com")) {
    const m = u.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
    if (m) return { provider: "google-drive", sourceUrl: raw, sourceId: m[1] };
    return null;
  }

  // ---- Terabox: /s/<token> (1024tera / terabox / mirrobox hosts) ----
  if (host.includes("terabox") || host.includes("1024tera") || host.includes("mirrobox") || host.includes("terashare")) {
    const token = u.pathname.split("/").filter(Boolean).pop();
    if (token) return { provider: "terabox", sourceUrl: raw, sourceId: token };
    return null;
  }

  // ---- Direct file ----
  if (/\.(mp4|webm|m3u8)(\?|#|$)/i.test(u.pathname)) {
    return { provider: "direct", sourceUrl: raw, sourceId: raw };
  }
  return null;
}

/** Playable URL for the player. `mode: "embed"` for iframes, `"file"` for <video>. */
export function embedUrl(ref: VideoRef, mode: "embed" | "file" = "embed"): string {
  switch (ref.provider) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${ref.sourceId}?rel=0&modestbranding=1`;
    case "google-drive":
      if (mode === "file") return ref.directUrl ?? `https://drive.google.com/uc?export=download&id=${ref.sourceId}`;
      return `https://drive.google.com/file/d/${ref.sourceId}/preview`;
    case "terabox":
      // No official embed: prefer a teacher-attached direct URL, else the share page.
      return ref.directUrl ?? ref.sourceUrl;
    case "direct":
      return ref.sourceId;
  }
}

/** Can this lecture render inside our player (iframe or <video>)? */
export function isInlinePlayable(ref: Pick<VideoRef, "provider" | "directUrl">): boolean {
  if (ref.provider === "youtube" || ref.provider === "google-drive" || ref.provider === "direct") return true;
  return Boolean(ref.directUrl);
}

/**
 * Auto-structure a flat import (e.g. a YouTube playlist's items) into
 * Udemy-style sections of `perSection` lectures.
 */
export function structureImport(
  courseId: string,
  items: { title: string; video: VideoRef; durationSec?: number }[],
  perSection = 6
): CourseSection[] {
  const sections: CourseSection[] = [];
  items.forEach((item, i) => {
    if (i % perSection === 0) {
      sections.push({
        id: `${courseId}-s${sections.length + 1}`,
        title: `Section ${sections.length + 1}`,
        lectures: [],
      });
    }
    sections[sections.length - 1].lectures.push({
      id: `${courseId}-l${i + 1}`,
      title: item.title,
      durationSec: item.durationSec,
      video: item.video,
    });
  });
  return sections;
}

export function countLectures(course: VideoCourse): number {
  return course.sections.reduce((n, s) => n + s.lectures.length, 0);
}

export function validateCourse(course: VideoCourse): string[] {
  const issues: string[] = [];
  if (course.sections.length === 0) issues.push(`${course.id}: no sections`);
  const seen = new Set<string>();
  for (const s of course.sections) {
    if (s.lectures.length === 0) issues.push(`${s.id}: no lectures`);
    for (const l of s.lectures) {
      if (seen.has(l.id)) issues.push(`${l.id}: duplicate lecture id`);
      seen.add(l.id);
      if (!l.title) issues.push(`${l.id}: missing title`);
      if (!l.video.sourceUrl) issues.push(`${l.id}: missing video URL`);
    }
  }
  return issues;
}
