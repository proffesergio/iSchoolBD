import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export type LessonKind = 'interactive' | 'video' | 'quiz';
export type VideoProvider = 'youtube' | 'google-drive' | 'terabox' | 'direct';

export interface LessonRecord {
  id: string;
  chapterId: string;
  titleBn: string;
  titleEn: string;
  kind: LessonKind;
  refId?: string;
  xp: number;
  /** manual voice-over (admin-uploaded audio) for child materials */
  audioUrl?: string;
  audioText?: string;
  updatedAt: string;
}

export interface ChapterRecord {
  id: string;
  courseId: string;
  titleBn: string;
  titleEn: string;
}

export interface CourseRecord {
  id: string;
  classId: string;
  subject: string;
  titleBn: string;
  titleEn: string;
}

export interface LectureRecord {
  id: string;
  sectionId: string;
  title: string;
  provider: VideoProvider;
  sourceUrl: string;
  directUrl?: string;
  durationSec?: number;
  checkpoints?: Checkpoint[];
}

export interface Checkpoint {
  atSec: number;
  prompt: string;
  choices: string[];
  correctChoiceIndex: number;
  xp?: number;
}

/** Shared with apps/web/lib/video-sources.ts validateCheckpoints. */
export function validateCheckpoints(checkpoints: Checkpoint[] | undefined): string[] {
  if (!checkpoints) return [];
  const issues: string[] = [];
  if (checkpoints.length > 10) issues.push('at most 10 checkpoints per lecture');
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

export interface SectionRecord {
  id: string;
  courseId: string;
  title: string;
}

export interface VideoCourseRecord {
  id: string;
  titleBn: string;
  titleEn: string;
  classId?: string;
  subject?: string;
}

const PROVIDERS: VideoProvider[] = ['youtube', 'google-drive', 'terabox', 'direct'];
const KINDS: LessonKind[] = ['interactive', 'video', 'quiz'];

// Backend-owned content seeds mirror apps/web/lib/curriculum.ts course/
// chapter titles. Sprint 2 migrates the 54 web seed lessons through the
// admin API; the backend is source of truth from here on.
const COURSE_SEEDS: Array<{
  id: string; classId: string; subject: string; titleBn: string; titleEn: string;
  chapters: Array<{ id: string; titleBn: string; titleEn: string }>;
}> = [
  { id: 'c1-bangla', classId: 'class-1', subject: 'bangla', titleBn: 'বাংলা (১ম শ্রেণি)', titleEn: 'Bangla (Class 1)', chapters: [
    { id: 'c1-bn-sworoborno', titleBn: 'স্বরবর্ণ', titleEn: 'Vowels' },
    { id: 'c1-bn-byanjon', titleBn: 'ব্যঞ্জনবর্ণ', titleEn: 'Consonants' },
  ] },
  { id: 'c1-math', classId: 'class-1', subject: 'math', titleBn: 'গণিত (১ম শ্রেণি)', titleEn: 'Math (Class 1)', chapters: [
    { id: 'c1-ma-count', titleBn: 'গণনা', titleEn: 'Counting' },
    { id: 'c1-ma-add', titleBn: 'যোগ', titleEn: 'Addition' },
  ] },
  { id: 'c1-english', classId: 'class-1', subject: 'english', titleBn: 'ইংরেজি (১ম শ্রেণি)', titleEn: 'English (Class 1)', chapters: [
    { id: 'c1-en-alpha', titleBn: 'বর্ণমালা', titleEn: 'Alphabet' },
    { id: 'c1-en-words', titleBn: 'ছোট শব্দ', titleEn: 'First words' },
  ] },
  { id: 'c2-bangla', classId: 'class-2', subject: 'bangla', titleBn: 'বাংলা (২য় শ্রেণি)', titleEn: 'Bangla (Class 2)', chapters: [
    { id: 'c2-bn-jukto', titleBn: 'যুক্তবর্ণ', titleEn: 'Conjuncts' },
    { id: 'c2-bn-rhyme', titleBn: 'ছড়া', titleEn: 'Rhymes' },
  ] },
  { id: 'c2-math', classId: 'class-2', subject: 'math', titleBn: 'গণিত (২য় শ্রেণি)', titleEn: 'Math (Class 2)', chapters: [
    { id: 'c2-ma-add2', titleBn: 'বড় যোগ', titleEn: 'Bigger addition' },
    { id: 'c2-ma-sub', titleBn: 'বিয়োগ', titleEn: 'Subtraction' },
  ] },
  { id: 'c2-english', classId: 'class-2', subject: 'english', titleBn: 'ইংরেজি (২য় শ্রেণি)', titleEn: 'English (Class 2)', chapters: [
    { id: 'c2-en-sent', titleBn: 'ছোট বাক্য', titleEn: 'Little sentences' },
    { id: 'c2-en-rhyme', titleBn: 'Rhymes', titleEn: 'English rhymes' },
  ] },
  { id: 'c3-bangla', classId: 'class-3', subject: 'bangla', titleBn: 'বাংলা (৩য় শ্রেণি)', titleEn: 'Bangla (Class 3)', chapters: [
    { id: 'c3-bn-golpo', titleBn: 'গল্প', titleEn: 'Stories' },
    { id: 'c3-bn-byakaron', titleBn: 'ব্যাকরণ', titleEn: 'Grammar' },
  ] },
  { id: 'c3-math', classId: 'class-3', subject: 'math', titleBn: 'গণিত (৩য় শ্রেণি)', titleEn: 'Math (Class 3)', chapters: [
    { id: 'c3-ma-add3', titleBn: 'যোগ-বিয়োগ', titleEn: 'Add and subtract' },
    { id: 'c3-ma-mul', titleBn: 'গুণ', titleEn: 'Multiplication' },
  ] },
  { id: 'c3-english', classId: 'class-3', subject: 'english', titleBn: 'ইংরেজি (৩য় শ্রেণি)', titleEn: 'English (Class 3)', chapters: [
    { id: 'c3-en-read', titleBn: 'পড়া', titleEn: 'Reading' },
    { id: 'c3-en-gram', titleBn: 'Grammar', titleEn: 'Grammar' },
  ] },
];

@Injectable()
export class CatalogService {
  private courses = new Map<string, CourseRecord>();
  private chapters = new Map<string, ChapterRecord>();
  private lessons = new Map<string, LessonRecord>();
  private videoCourses = new Map<string, VideoCourseRecord>();
  private sections = new Map<string, SectionRecord>();
  private lectures = new Map<string, LectureRecord>();

  constructor() {
    for (const c of COURSE_SEEDS) {
      this.courses.set(c.id, { id: c.id, classId: c.classId, subject: c.subject, titleBn: c.titleBn, titleEn: c.titleEn });
      for (const ch of c.chapters) {
        this.chapters.set(ch.id, { id: ch.id, courseId: c.id, titleBn: ch.titleBn, titleEn: ch.titleEn });
      }
    }
    this.videoCourses.set('gonit-1-intro', {
      id: 'gonit-1-intro', titleBn: 'গণনা শেখো', titleEn: 'Learn Counting', classId: 'class-1', subject: 'math',
    });
    this.sections.set('gonit-1-intro-s1', { id: 'gonit-1-intro-s1', courseId: 'gonit-1-intro', title: 'Section 1' });
    this.lectures.set('gonit-1-intro-l1', {
      id: 'gonit-1-intro-l1', sectionId: 'gonit-1-intro-s1', title: '১–১০ গণনা',
      provider: 'youtube', sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationSec: 240,
    });
    this.lectures.set('gonit-1-intro-l2', {
      id: 'gonit-1-intro-l2', sectionId: 'gonit-1-intro-s1', title: '১১–২০ গণনা',
      provider: 'google-drive', sourceUrl: 'https://drive.google.com/file/d/1DEMOfileIDabc/view?usp=sharing', durationSec: 300,
    });
  }

  // ---- public reads (single course tree for the storefront) ----
  listCourses() {
    return [...this.courses.values()];
  }

  courseTree(courseId: string) {
    const course = this.courses.get(courseId);
    if (!course) throw new NotFoundException(`Unknown course: ${courseId}`);
    const chapters = [...this.chapters.values()].filter((c) => c.courseId === courseId);
    return {
      ...course,
      chapters: chapters.map((ch) => ({
        ...ch,
        lessons: [...this.lessons.values()].filter((l) => l.chapterId === ch.id),
      })),
    };
  }

  listVideoCourses() {
    return [...this.videoCourses.values()].map((c) => ({
      ...c,
      lectureCount: [...this.lectures.values()].filter((l) => {
        const s = this.sections.get(l.sectionId);
        return s?.courseId === c.id;
      }).length,
    }));
  }

  videoCourseTree(courseId: string) {
    const course = this.videoCourses.get(courseId);
    if (!course) throw new NotFoundException(`Unknown video course: ${courseId}`);
    const sections = [...this.sections.values()].filter((s) => s.courseId === courseId);
    return {
      ...course,
      sections: sections.map((s) => ({
        ...s,
        lectures: [...this.lectures.values()].filter((l) => l.sectionId === s.id),
      })),
    };
  }

  counts() {
    return {
      courses: this.courses.size,
      chapters: this.chapters.size,
      lessons: this.lessons.size,
      videoCourses: this.videoCourses.size,
      lectures: this.lectures.size,
    };
  }

  // ---- admin writes ----
  upsertCourse(input: { id: string; classId: string; subject: string; titleBn: string; titleEn: string }) {
    if (!input.id.trim() || !input.classId.trim() || !input.subject.trim() || !input.titleBn.trim() || !input.titleEn.trim()) {
      throw new BadRequestException('id, classId, subject, titleBn, titleEn are required');
    }
    const record: CourseRecord = { ...input };
    this.courses.set(input.id, record);
    return record;
  }

  upsertChapter(input: { id: string; courseId: string; titleBn: string; titleEn: string }) {
    if (!this.courses.has(input.courseId)) throw new NotFoundException(`Unknown course: ${input.courseId}`);
    if (!input.id.trim() || !input.titleBn.trim() || !input.titleEn.trim()) {
      throw new BadRequestException('id, titleBn, titleEn are required');
    }
    const record: ChapterRecord = { ...input };
    this.chapters.set(input.id, record);
    return record;
  }

  upsertLesson(input: {
    id: string; chapterId: string; titleBn: string; titleEn: string;
    kind: LessonKind; refId?: string; xp?: number; audioUrl?: string; audioText?: string;
  }) {
    if (!this.chapters.has(input.chapterId)) throw new NotFoundException(`Unknown chapter: ${input.chapterId}`);
    if (!KINDS.includes(input.kind)) throw new BadRequestException(`kind must be ${KINDS.join('|')}`);
    if (!input.id.trim() || !input.titleBn.trim() || !input.titleEn.trim()) {
      throw new BadRequestException('id, titleBn, titleEn are required');
    }
    if (input.audioUrl && input.audioUrl.length > 500) throw new BadRequestException('audioUrl too long');
    if (input.audioText && input.audioText.length > 500) throw new BadRequestException('audioText too long');
    const xp = input.xp ?? 10;
    if (!Number.isInteger(xp) || xp < 0 || xp > 500) throw new BadRequestException('xp must be 0-500');
    const record: LessonRecord = {
      id: input.id, chapterId: input.chapterId, titleBn: input.titleBn,
      titleEn: input.titleEn, kind: input.kind, refId: input.refId,
      audioUrl: input.audioUrl || undefined, audioText: input.audioText || undefined,
      xp, updatedAt: new Date().toISOString(),
    };
    this.lessons.set(input.id, record);
    return record;
  }

  deleteLesson(id: string) {
    if (!this.lessons.delete(id)) throw new NotFoundException(`Unknown lesson: ${id}`);
    return { deleted: id };
  }

  upsertVideoCourse(input: { id: string; titleBn: string; titleEn: string; classId?: string; subject?: string }) {
    if (!input.id.trim() || !input.titleBn.trim() || !input.titleEn.trim()) {
      throw new BadRequestException('id, titleBn, titleEn are required');
    }
    const record: VideoCourseRecord = { ...input };
    this.videoCourses.set(input.id, record);
    return record;
  }

  upsertSection(input: { id: string; courseId: string; title: string }) {
    if (!this.videoCourses.has(input.courseId)) throw new NotFoundException(`Unknown video course: ${input.courseId}`);
    if (!input.id.trim() || !input.title.trim()) {
      throw new BadRequestException('id and title are required');
    }
    const existing = this.sections.get(input.id);
    if (existing && existing.courseId !== input.courseId) {
      throw new BadRequestException(`Section ${input.id} belongs to another course.`);
    }
    const record: SectionRecord = { ...input };
    this.sections.set(input.id, record);
    return record;
  }

  deleteSection(id: string) {
    if (!this.sections.has(id)) throw new NotFoundException(`Unknown section: ${id}`);
    const lectures = [...this.lectures.values()].filter((l) => l.sectionId === id).map((l) => l.id);
    for (const lid of lectures) this.lectures.delete(lid);
    this.sections.delete(id);
    return { deleted: id, lecturesRemoved: lectures.length };
  }

  upsertLecture(input: {
    id: string; sectionId?: string; courseId?: string; sectionTitle?: string;
    title: string; provider: VideoProvider; sourceUrl: string; directUrl?: string; durationSec?: number;
    checkpoints?: Checkpoint[];
  }) {
    if (!PROVIDERS.includes(input.provider)) throw new BadRequestException(`provider must be ${PROVIDERS.join('|')}`);
    if (!input.id.trim() || !input.title.trim() || !input.sourceUrl.trim()) {
      throw new BadRequestException('id, title, sourceUrl are required');
    }
    const cpIssues = validateCheckpoints(input.checkpoints);
    if (cpIssues.length > 0) throw new BadRequestException(cpIssues.join('; '));
    let sectionId = input.sectionId ?? '';
    if (!sectionId) {
      // Auto-create a section under the target course (Udemy-style structuring from the panel).
      if (!input.courseId || !this.videoCourses.has(input.courseId)) {
        throw new NotFoundException(`Unknown video course: ${input.courseId ?? '(missing courseId)'}`);
      }
      const existing = [...this.sections.values()].filter((s) => s.courseId === input.courseId);
      sectionId = `${input.courseId}-s${existing.length + 1}`;
      this.sections.set(sectionId, {
        id: sectionId, courseId: input.courseId, title: input.sectionTitle ?? `Section ${existing.length + 1}`,
      });
    }
    if (!this.sections.has(sectionId)) throw new NotFoundException(`Unknown section: ${sectionId}`);
    const record: LectureRecord = {
      id: input.id, sectionId, title: input.title, provider: input.provider,
      sourceUrl: input.sourceUrl, directUrl: input.directUrl, durationSec: input.durationSec,
      checkpoints: input.checkpoints?.length ? [...input.checkpoints].sort((a, b) => a.atSec - b.atSec) : undefined,
    };
    this.lectures.set(input.id, record);
    return record;
  }

  deleteLecture(id: string) {
    if (!this.lectures.delete(id)) throw new NotFoundException(`Unknown lecture: ${id}`);
    return { deleted: id };
  }
}
