/**
 * Foundation curriculum registry — Class 1–3 core (Bangla, Math, English).
 *
 * Hierarchy: class → subject course → chapter → lesson.
 * Lessons are lightweight refs: interactive lessons reuse the existing
 * track/book engine via `trackId`, video lessons point at the video
 * catalog via `videoId`, quizzes are inline prompts.
 * Full NCTB chapter coverage is built sprint-by-sprint (see docs/ROADMAP.md);
 * this file owns the schema + seed chapters so every sprint appends data,
 * never new plumbing.
 */

export type ClassId = "class-1" | "class-2" | "class-3";
export type CoreSubject = "bangla" | "math" | "english" | "science";

export const SUBJECT_META: Record<CoreSubject, { emoji: string; bn: string; en: string }> = {
  bangla: { emoji: "📝", bn: "বাংলা", en: "Bangla" },
  math: { emoji: "🔢", bn: "গণিত", en: "Math" },
  english: { emoji: "🔤", bn: "ইংরেজি", en: "English" },
  science: { emoji: "🔬", bn: "বিজ্ঞান", en: "Science" },
};
export type LessonKind = "interactive" | "video" | "quiz";

export interface LessonRef {
  id: string;
  titleBn: string;
  titleEn: string;
  kind: LessonKind;
  /** interactive → TRACKS id (lib/tracks.ts); video → video catalog id */
  refId?: string;
  xp: number;
  /** manual voice-over for child materials (admin panel → catalog) */
  audioUrl?: string;
  audioText?: string;
}

export interface Chapter {
  id: string;
  titleBn: string;
  titleEn: string;
  lessons: LessonRef[];
}

export interface SubjectCourse {
  classId: ClassId;
  subject: CoreSubject;
  titleBn: string;
  titleEn: string;
  chapters: Chapter[];
}

function lesson(id: string, titleBn: string, titleEn: string, kind: LessonKind, xp = 10, refId?: string): LessonRef {
  return { id, titleBn, titleEn, kind, xp, refId };
}

export const CURRICULUM: SubjectCourse[] = [
  {
    classId: "class-1", subject: "bangla", titleBn: "বাংলা (১ম শ্রেণি)", titleEn: "Bangla (Class 1)",
    chapters: [
      {
        id: "c1-bn-sworoborno", titleBn: "স্বরবর্ণ", titleEn: "Vowels",
        lessons: [
          lesson("c1-bn-sw-1", "অ–ঔ চেনো", "Meet the vowels", "interactive", 10),
          lesson("c1-bn-sw-2", "অ–ঔ ভিডিও", "Vowel video", "video", 10),
          lesson("c1-bn-sw-3", "স্বরবর্ণ কুইজ", "Vowel quiz", "quiz", 15),
        ],
      },
      {
        id: "c1-bn-byanjon", titleBn: "ব্যঞ্জনবর্ণ", titleEn: "Consonants",
        lessons: [
          lesson("c1-bn-by-1", "ক–ঙ চেনো", "First consonants", "interactive", 10),
          lesson("c1-bn-by-2", "ক–ঙ ভিডিও", "Consonant video", "video", 10),
          lesson("c1-bn-by-3", "ব্যঞ্জনবর্ণ কুইজ", "Consonant quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-1", subject: "math", titleBn: "গণিত (১ম শ্রেণি)", titleEn: "Math (Class 1)",
    chapters: [
      {
        id: "c1-ma-count", titleBn: "গণনা", titleEn: "Counting",
        lessons: [
          lesson("c1-ma-co-1", "১–২০ গণনা", "Count to 20", "interactive", 10),
          lesson("c1-ma-co-2", "গণনা ভিডিও", "Counting video", "video", 10),
          lesson("c1-ma-co-3", "গণনা কুইজ", "Counting quiz", "quiz", 15),
        ],
      },
      {
        id: "c1-ma-add", titleBn: "যোগ", titleEn: "Addition",
        lessons: [
          lesson("c1-ma-ad-1", "ছোট যোগ", "Small sums", "interactive", 10),
          lesson("c1-ma-ad-2", "যোগ ভিডিও", "Addition video", "video", 10),
          lesson("c1-ma-ad-3", "যোগ কুইজ", "Addition quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-1", subject: "english", titleBn: "ইংরেজি (১ম শ্রেণি)", titleEn: "English (Class 1)",
    chapters: [
      {
        id: "c1-en-alpha", titleBn: "বর্ণমালা", titleEn: "Alphabet",
        lessons: [
          lesson("c1-en-al-1", "A–Z চেনো", "Meet A–Z", "interactive", 10),
          lesson("c1-en-al-2", "Alphabet video", "Alphabet video", "video", 10),
          lesson("c1-en-al-3", "Alphabet quiz", "Alphabet quiz", "quiz", 15),
        ],
      },
      {
        id: "c1-en-words", titleBn: "ছোট শব্দ", titleEn: "First words",
        lessons: [
          lesson("c1-en-wo-1", "Cat, Dog, Sun", "Cat, Dog, Sun", "interactive", 10),
          lesson("c1-en-wo-2", "Words video", "Words video", "video", 10),
          lesson("c1-en-wo-3", "Words quiz", "Words quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-2", subject: "bangla", titleBn: "বাংলা (২য় শ্রেণি)", titleEn: "Bangla (Class 2)",
    chapters: [
      {
        id: "c2-bn-jukto", titleBn: "যুক্তবর্ণ", titleEn: "Conjuncts",
        lessons: [
          lesson("c2-bn-ju-1", "যুক্তবর্ণ চেনো", "Meet conjuncts", "interactive", 10),
          lesson("c2-bn-ju-2", "যুক্তবর্ণ ভিডিও", "Conjunct video", "video", 10),
          lesson("c2-bn-ju-3", "যুক্তবর্ণ কুইজ", "Conjunct quiz", "quiz", 15),
        ],
      },
      {
        id: "c2-bn-rhyme", titleBn: "ছড়া", titleEn: "Rhymes",
        lessons: [
          lesson("c2-bn-rh-1", "ছড়া শোনো", "Hear rhymes", "interactive", 10),
          lesson("c2-bn-rh-2", "ছড়া ভিডিও", "Rhyme video", "video", 10),
          lesson("c2-bn-rh-3", "ছড়া কুইজ", "Rhyme quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-2", subject: "math", titleBn: "গণিত (২য় শ্রেণি)", titleEn: "Math (Class 2)",
    chapters: [
      {
        id: "c2-ma-add2", titleBn: "বড় যোগ", titleEn: "Bigger addition",
        lessons: [
          lesson("c2-ma-ad-1", "দুই অঙ্কের যোগ", "Two-digit sums", "interactive", 10, "math-3-addition"),
          lesson("c2-ma-ad-2", "যোগ ভিডিও", "Addition video", "video", 10),
          lesson("c2-ma-ad-3", "যোগ কুইজ", "Addition quiz", "quiz", 15),
        ],
      },
      {
        id: "c2-ma-sub", titleBn: "বিয়োগ", titleEn: "Subtraction",
        lessons: [
          lesson("c2-ma-su-1", "ছোট বিয়োগ", "Small differences", "interactive", 10),
          lesson("c2-ma-su-2", "বিয়োগ ভিডিও", "Subtraction video", "video", 10),
          lesson("c2-ma-su-3", "বিয়োগ কুইজ", "Subtraction quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-2", subject: "english", titleBn: "ইংরেজি (২য় শ্রেণি)", titleEn: "English (Class 2)",
    chapters: [
      {
        id: "c2-en-sent", titleBn: "ছোট বাক্য", titleEn: "Little sentences",
        lessons: [
          lesson("c2-en-se-1", "I am…", "I am…", "interactive", 10),
          lesson("c2-en-se-2", "Sentence video", "Sentence video", "video", 10),
          lesson("c2-en-se-3", "Sentence quiz", "Sentence quiz", "quiz", 15),
        ],
      },
      {
        id: "c2-en-rhyme", titleBn: "Rhymes", titleEn: "English rhymes",
        lessons: [
          lesson("c2-en-rh-1", "Twinkle Twinkle", "Twinkle Twinkle", "interactive", 10),
          lesson("c2-en-rh-2", "Rhyme video", "Rhyme video", "video", 10),
          lesson("c2-en-rh-3", "Rhyme quiz", "Rhyme quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-3", subject: "bangla", titleBn: "বাংলা (৩য় শ্রেণি)", titleEn: "Bangla (Class 3)",
    chapters: [
      {
        id: "c3-bn-golpo", titleBn: "গল্প", titleEn: "Stories",
        lessons: [
          lesson("c3-bn-go-1", "গল্প শোনো", "Hear a story", "interactive", 10),
          lesson("c3-bn-go-2", "গল্প ভিডিও", "Story video", "video", 10),
          lesson("c3-bn-go-3", "গল্প কুইজ", "Story quiz", "quiz", 15),
        ],
      },
      {
        id: "c3-bn-byakaron", titleBn: "ব্যাকরণ", titleEn: "Grammar",
        lessons: [
          lesson("c3-bn-by-1", "বিশেষ্য-বিশেষণ", "Nouns and adjectives", "interactive", 10),
          lesson("c3-bn-by-2", "ব্যাকরণ ভিডিও", "Grammar video", "video", 10),
          lesson("c3-bn-by-3", "ব্যাকরণ কুইজ", "Grammar quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-3", subject: "math", titleBn: "গণিত (৩য় শ্রেণি)", titleEn: "Math (Class 3)",
    chapters: [
      {
        id: "c3-ma-add3", titleBn: "যোগ-বিয়োগ", titleEn: "Add and subtract",
        lessons: [
          lesson("c3-ma-ad-1", "যোগ-বিয়োগ ট্র্যাক", "Add/sub track", "interactive", 20, "math-3-addition"),
          lesson("c3-ma-ad-2", "যোগ ভিডিও", "Addition video", "video", 10),
          lesson("c3-ma-ad-3", "যোগ কুইজ", "Addition quiz", "quiz", 15),
        ],
      },
      {
        id: "c3-ma-mul", titleBn: "গুণ", titleEn: "Multiplication",
        lessons: [
          lesson("c3-ma-mu-1", "নামতা", "Times tables", "interactive", 10),
          lesson("c3-ma-mu-2", "গুণ ভিডিও", "Multiplication video", "video", 10),
          lesson("c3-ma-mu-3", "গুণ কুইজ", "Multiplication quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-3", subject: "english", titleBn: "ইংরেজি (৩য় শ্রেণি)", titleEn: "English (Class 3)",
    chapters: [
      {
        id: "c3-en-read", titleBn: "পড়া", titleEn: "Reading",
        lessons: [
          lesson("c3-en-re-1", "Short passage", "Short passage", "interactive", 10),
          lesson("c3-en-re-2", "Reading video", "Reading video", "video", 10),
          lesson("c3-en-re-3", "Reading quiz", "Reading quiz", "quiz", 15),
        ],
      },
      {
        id: "c3-en-gram", titleBn: "Grammar", titleEn: "Grammar",
        lessons: [
          lesson("c3-en-gr-1", "am / is / are", "am / is / are", "interactive", 10),
          lesson("c3-en-gr-2", "Grammar video", "Grammar video", "video", 10),
          lesson("c3-en-gr-3", "Grammar quiz", "Grammar quiz", "quiz", 15),
        ],
      },
    ],
  },
  {
    classId: "class-3", subject: "science", titleBn: "বিজ্ঞান (৩য় শ্রেণি)", titleEn: "Science (Class 3)",
    chapters: [
      {
        id: "c3-sc-life", titleBn: "জীব ও জড়", titleEn: "Living and non-living",
        lessons: [
          lesson("c3-sc-li-1", "জীব চেনো", "Meet living things", "interactive", 10),
          lesson("c3-sc-li-2", "জীব ভিডিও", "Living things video", "video", 10),
          lesson("c3-sc-li-3", "জীব কুইজ", "Living quiz", "quiz", 15),
        ],
      },
      {
        id: "c3-sc-env", titleBn: "আমাদের পরিবেশ", titleEn: "Our environment",
        lessons: [
          lesson("c3-sc-en-1", "পরিবেশ চেনো", "Meet the environment", "interactive", 10),
          lesson("c3-sc-en-2", "পরিবেশ ভিডিও", "Environment video", "video", 10),
          lesson("c3-sc-en-3", "পরিবেশ কুইজ", "Environment quiz", "quiz", 15),
        ],
      },
    ],
  },
];

export function getCourse(classId: ClassId, subject: CoreSubject): SubjectCourse | undefined {
  return CURRICULUM.find((c) => c.classId === classId && c.subject === subject);
}

export function countLessons(): number {
  return CURRICULUM.reduce(
    (n, c) => n + c.chapters.reduce((m, ch) => m + ch.lessons.length, 0),
    0
  );
}

/** Every id unique, every lesson has a title, xp in range. Returns issue strings. */
export function validateCurriculum(courses: SubjectCourse[] = CURRICULUM): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const c of courses) {
    if (c.chapters.length === 0) issues.push(`${c.classId}/${c.subject}: no chapters`);
    for (const ch of c.chapters) {
      if (ch.lessons.length === 0) issues.push(`${ch.id}: no lessons`);
      for (const l of ch.lessons) {
        if (seen.has(l.id)) issues.push(`${l.id}: duplicate lesson id`);
        seen.add(l.id);
        if (!l.titleBn || !l.titleEn) issues.push(`${l.id}: missing title`);
        if (l.xp < 0 || l.xp > 500) issues.push(`${l.id}: xp out of range`);
      }
    }
  }
  return issues;
}
