/**
 * Book registry — Primary level only (classes 1–5), per program scope.
 * Class 1: 4 official books. Class 2: 4. Class 3: 15 (incl. BGS + religions).
 * Only nctb-1-bn is content-mapped; the rest embed immediately and gain
 * chapter maps + our quiz pattern once their PDFs are readable
 * (Drive quota blocks re-downloads until cleared — see docs/NCTB-CLASS1-BN.md).
 */

export interface BookDef {
  id: string;
  classId: string;
  subject: string;
  emoji: string;
  titleBn: string;
  titleEn: string;
  driveFileId: string;
  /** false = embed-only until its map is verified */
  mapped: boolean;
  note: string;
}

export interface CustomBook {
  id: string;
  classId: string;
  titleBn: string;
  titleEn: string;
  driveFileId: string;
  note?: string;
}

export const SUBJECT_DISPLAY: Record<string, { emoji: string; bn: string; en: string }> = {
  bangla: { emoji: "📖", bn: "বাংলা", en: "Bangla" },
  english: { emoji: "📕", bn: "ইংরেজি", en: "English" },
  math: { emoji: "🔢", bn: "গণিত", en: "Math" },
  science: { emoji: "🔬", bn: "বিজ্ঞান", en: "Science" },
  bgs: { emoji: "🌍", bn: "বাংলাদেশ ও বিশ্ব", en: "BGS" },
  islam: { emoji: "☪️", bn: "ইসলাম শিক্ষা", en: "Islam" },
  hindu: { emoji: "🕉️", bn: "হিন্দুধর্ম", en: "Hinduism" },
  buddha: { emoji: "☸️", bn: "বৌদ্ধধর্ম", en: "Buddhism" },
  chris: { emoji: "✝️", bn: "খ্রিষ্টধর্ম", en: "Christianity" },
};

function b(
  id: string, classId: string, subject: string, emoji: string,
  titleBn: string, titleEn: string, driveFileId: string,
  mapped: boolean, note: string
): BookDef {
  return { id, classId, subject, emoji, titleBn, titleEn, driveFileId, mapped, note };
}

const QUEUED = "PDF পড়ো · সূচি যাচাই চলছে ⏳";
const SLOT = "স্লট প্রস্তুত — অ্যাডমিন প্যানেল থেকে PDF লিংক যোগ করো 📥";

export const OFFICIAL_BOOKS: BookDef[] = [
  b("nctb-1-bn", "class-1", "bangla", "📖", "আমার বাংলা বই", "Amar Bangla Boi (Class 1)",
    "1hf-W5GVlAy3cHstFlozNBuE2oz7u9YXy", true, "৫৪ পাঠ · যাচাইকৃত মানচিত্র + অনুশীলন"),
  b("nctb-1-en", "class-1", "english", "📕", "English For Today", "Class 1 English (NCTB)",
    "1UX9fbOBUKrf3mMh6E0I-Gw2emoQV-XWy", false, QUEUED),
  b("nctb-1-math-bn", "class-1", "math", "🔢", "গণিত (বাংলা)", "Class 1 Math, Bangla version (NCTB)",
    "1V5eBwsQYrG-6qajVZUwwetml5Oezl10r", false, QUEUED),
  b("nctb-1-math-en", "class-1", "math", "🔣", "গণিত (English)", "Class 1 Math, English version (NCTB)",
    "1D8QeLW7SZ2d7oPJM3TmQei9_bOEet2i5", false, QUEUED),
  // ---- Class 2 (Bangla BN+EN = same file) ----
  b("nctb-2-bn", "class-2", "bangla", "📖", "আমার বাংলা বই", "Class 2 Bangla (NCTB, BN+EN same book)",
    "1XKPmmrgK1vVSjybgbzu_RZMCOVXqFHH3", false, "BN+EN একই বই · " + QUEUED),
  b("nctb-2-en", "class-2", "english", "📕", "English For Today", "Class 2 English (NCTB)",
    "1timM9_-X87oqE-C5yCsV5kYf2JKydzEK", false, QUEUED),
  b("nctb-2-math-bn", "class-2", "math", "🔢", "গণিত (বাংলা)", "Class 2 Math, Bangla version (NCTB)",
    "1QY1URkKhpoAqVTuPRaLHgBJZ7_3lGpyq", false, QUEUED),
  b("nctb-2-math-en", "class-2", "math", "🔣", "গণিত (English)", "Class 2 Math, English version (NCTB)",
    "1yofkAU1FjyoYcx2nZGEqhlnH4xbE9YHJ", false, QUEUED),
  // ---- Class 3 (Bangla BN+EN = same file) ----
  b("nctb-3-bn", "class-3", "bangla", "📖", "আমার বাংলা বই", "Class 3 Bangla (NCTB, BN+EN same book)",
    "1Je1KylPoJBiYt-lW5qqaH8BszIk0VJVz", false, "BN+EN একই বই · " + QUEUED),
  b("nctb-3-en", "class-3", "english", "📕", "English For Today", "Class 3 English (NCTB)",
    "1gy7q4njDpOKGULXzGQVvhq2ZGpZMOfif", false, QUEUED),
  b("nctb-3-math-bn", "class-3", "math", "🔢", "গণিত (বাংলা)", "Class 3 Math, Bangla version (NCTB)",
    "1sd7ebdMkuU6Wv0BUgccqYV4UxpwUmTyC", false, QUEUED),
  b("nctb-3-math-en", "class-3", "math", "🔣", "গণিত (English)", "Class 3 Math, English version (NCTB)",
    "115wNAy7MFdjmux9UvW7YzCwTYe8-tF-n", false, QUEUED),
  b("nctb-3-sci-bn", "class-3", "science", "🔬", "বিজ্ঞান (বাংলা)", "Class 3 Science, Bangla version (NCTB)",
    "1jn-X5lOgECnoypp29eYtYAw_DHZ9qhm6", false, QUEUED),
  b("nctb-3-sci-en", "class-3", "science", "🧪", "বিজ্ঞান (English)", "Class 3 Science, English version (NCTB)",
    "1Z_dMhkriUM96PjEHDbuWoZ6J6wHmzXFk", false, QUEUED),
  b("nctb-3-bgs-bn", "class-3", "bgs", "🌍", "বাংলাদেশ ও বিশ্বপরিচয়", "Class 3 BGS, Bangla version (NCTB)",
    "15XHREkEQf7PioxmaVo7fW-EWLRKYrDEw", false, QUEUED),
  b("nctb-3-bgs-en", "class-3", "bgs", "🗺️", "Bangladesh & World (English)", "Class 3 BGS, English version (NCTB)",
    "1WWn8zYXo56hGUYzl20_TJokOgr05ltig", false, QUEUED),
  b("nctb-3-islam-bn", "class-3", "islam", "☪️", "ইসলাম শিক্ষা", "Class 3 Islam, Bangla version (NCTB)",
    "1KSegBPjHNygGuJJE77byNjBAv-HNvz9y", false, QUEUED),
  b("nctb-3-islam-en", "class-3", "islam", "🌙", "Islam (English)", "Class 3 Islam, English version (NCTB)",
    "1_guOxSH27DQo8TWnoe5d0oeoF69jROfT", false, QUEUED),
  b("nctb-3-hindu-bn", "class-3", "hindu", "🕉️", "হিন্দুধর্ম শিক্ষা", "Class 3 Hinduism, Bangla version (NCTB)",
    "1MnUeQUpgNz83fslF3lCT-ttuWaPkrRs0", false, QUEUED),
  b("nctb-3-hindu-en", "class-3", "hindu", "🪔", "Hinduism (English)", "Class 3 Hinduism, English version (NCTB)",
    "1xSpVBi0VNZEqb1N1prIjqC945StT8Jvm", false, QUEUED),
  b("nctb-3-buddha-bn", "class-3", "buddha", "☸️", "বৌদ্ধধর্ম শিক্ষা", "Class 3 Buddhism, Bangla version (NCTB)",
    "1hStfhnRzkyVi-LIJ65Z2XNn-Ul-2wfC2", false, QUEUED),
  b("nctb-3-buddha-en", "class-3", "buddha", "🪷", "Buddhism (English)", "Class 3 Buddhism, English version (NCTB)",
    "1hPTTEmTG2XqcwYNAkEOq6PG13ulQC6in", false, QUEUED),
  b("nctb-3-chris-bn", "class-3", "chris", "✝️", "খ্রিষ্টধর্ম শিক্ষা", "Class 3 Christianity, Bangla version (NCTB)",
    "1g5celNzNGe0pLzfT28PWxCIEg1pmOg_Y", false, QUEUED),
  b("nctb-3-chris-en", "class-3", "chris", "⛪", "Christianity (English)", "Class 3 Christianity, English version (NCTB)",
    "1FoJO18h0TmwupjFBoLjAJlJW1gwYdoRn", false, QUEUED),
  // ---- Class 4 slots (PDFs land via admin panel) ----
  b("nctb-4-bn", "class-4", "bangla", "📖", "আমার বাংলা বই", "Class 4 Bangla (NCTB)", "", false, SLOT),
  b("nctb-4-en", "class-4", "english", "📕", "English For Today", "Class 4 English (NCTB)", "", false, SLOT),
  b("nctb-4-math-bn", "class-4", "math", "🔢", "গণিত (বাংলা)", "Class 4 Math, Bangla version (NCTB)", "", false, SLOT),
  b("nctb-4-math-en", "class-4", "math", "🔣", "গণিত (English)", "Class 4 Math, English version (NCTB)", "", false, SLOT),
  b("nctb-4-sci", "class-4", "science", "🔬", "বিজ্ঞান", "Class 4 Science (NCTB)", "", false, SLOT),
  b("nctb-4-bgs", "class-4", "bgs", "🌍", "বাংলাদেশ ও বিশ্বপরিচয়", "Class 4 BGS (NCTB)", "", false, SLOT),
  // ---- Class 5 slots (PDFs land via admin panel) ----
  b("nctb-5-bn", "class-5", "bangla", "📖", "আমার বাংলা বই", "Class 5 Bangla (NCTB)", "", false, SLOT),
  b("nctb-5-en", "class-5", "english", "📕", "English For Today", "Class 5 English (NCTB)", "", false, SLOT),
  b("nctb-5-math-bn", "class-5", "math", "🔢", "গণিত (বাংলা)", "Class 5 Math, Bangla version (NCTB)", "", false, SLOT),
  b("nctb-5-math-en", "class-5", "math", "🔣", "গণিত (English)", "Class 5 Math, English version (NCTB)", "", false, SLOT),
  b("nctb-5-sci", "class-5", "science", "🔬", "বিজ্ঞান", "Class 5 Science (NCTB)", "", false, SLOT),
  b("nctb-5-bgs", "class-5", "bgs", "🌍", "বাংলাদেশ ও বিশ্বপরিচয়", "Class 5 BGS (NCTB)", "", false, SLOT),
];

export function getBook(id: string): BookDef | undefined {
  return OFFICIAL_BOOKS.find((x) => x.id === id);
}

export function booksForClass(classId: string): BookDef[] {
  return OFFICIAL_BOOKS.filter((x) => x.classId === classId);
}

export function bookPreviewUrl(driveFileId: string): string {
  return `https://drive.google.com/file/d/${driveFileId}/preview`;
}

export function validateBooks(books: BookDef[] = OFFICIAL_BOOKS): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const x of books) {
    if (seen.has(x.id)) issues.push(`${x.id}: duplicate`);
    seen.add(x.id);
    if (!x.titleBn.trim() || !x.titleEn.trim()) issues.push(`${x.id}: missing title`);
    // Empty driveFileId = unfilled slot (admin uploads the PDF later).
    if (x.driveFileId && !/^[\w-]{10,}$/.test(x.driveFileId)) issues.push(`${x.id}: bad drive id`);
    if (!SUBJECT_DISPLAY[x.subject]) issues.push(`${x.id}: unknown subject ${x.subject}`);
  }
  return issues;
}

/**
 * Merge admin uploads over official slots by id (custom wins).
 * Slots without a file stay visible as "awaiting PDF".
 */
export function resolveBooks(
  official: BookDef[] = OFFICIAL_BOOKS,
  custom: { id: string; classId: string; titleBn: string; titleEn: string; driveFileId: string; note?: string }[] = []
): (BookDef & { custom: boolean })[] {
  const over = new Map(custom.map((c) => [c.id, c]));
  return official.map((o) => {
    const c = over.get(o.id);
    if (!c) return { ...o, custom: false };
    return {
      ...o,
      titleBn: c.titleBn || o.titleBn,
      titleEn: c.titleEn || o.titleEn,
      driveFileId: c.driveFileId || o.driveFileId,
      note: c.note ?? o.note,
      custom: true,
    };
  });
}
