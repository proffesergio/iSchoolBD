/**
 * NCTB "আমার বাংলা বই" (Class 1) — real book map.
 * Source: NCTB 2023 curriculum PDF (90 scanned pages, see docs/NCTB-CLASS1-BN.md).
 * Verified (v2) = page image read by the team: header + content confirmed.
 * TOC-only (v0) = title from সূচিপত্র, page/practice land in later batches.
 * PDF offset rule: pdfIndex = printedPage + 8 (verified on 6 samples).
 */

export const NCTB_CLASS1_BN = {
  bookId: "nctb-1-bn",
  titleBn: "আমার বাংলা বই",
  titleEn: "Amar Bangla Boi (Class 1)",
  classId: "class-1",
  driveFileId: "1hf-W5GVlAy3cHstFlozNBuE2oz7u9YXy",
  pdfPages: 90,
  pdfOffset: 8,
} as const;

export interface NctbPath {
  no: number;
  title: string;
  /** printed book page (badge-verified where v>=1) */
  page?: number;
  /** 0-based PDF index (verified where v>=1) */
  pdf?: number;
  /** 0 = TOC only, 1 = header seen, 2 = content read */
  v: 0 | 1 | 2;
  /** track lesson id in nctb-1-bn-path (practice link) */
  lesson?: string;
}

function p(no: number, title: string, page?: number, pdf?: number, v: 0 | 1 | 2 = 0, lesson?: string): NctbPath {
  return { no, title, page, pdf, v, lesson };
}

export const NCTB_PATHS: NctbPath[] = [
  p(1, "আমার পরিচয়", 1, 9, 2, "n1"),
  p(2, "এসো রং করি ও আঁকি", 2, 10, 2, "n2"),
  p(3, "আমি ও আমার বিদ্যালয়", 3, 11, 2, "n3"),
  p(4, "আমি ও আমার সহপাঠীরা", 4, 12, 2, "n4"),
  p(5, "আঁকাআঁকি", 6, 14, 2, "n5"),
  p(6, "আমরা কী কী করি", 8, 16, 2, "n6"),
  p(7, "আঁকাআঁকি", 9, 17, 2, "n9"),
  p(8, "ছড়া", 11, 19, 2, "n7"),
  p(9, "বাঘ ও রাখাল", 12, 20, 2, "n8"),
  p(10, "নাম ও বানান"),
  p(11, "বর্ণ শিখি : অ আ"),
  p(12, "বর্ণ শিখি : ই ঈ"),
  p(13, "বর্ণ শিখি : উ ঊ"),
  p(14, "বর্ণ শিখি : ঋ"),
  p(15, "বর্ণ শিখি : এ ঐ"),
  p(16, "স্বরবর্ণ", 22, 30, 2),
  p(17, "কারচিহ্ন দেখি"),
  p(18, "বর্ণ শিখি : ক খ গ ঘ ঙ"),
  p(19, "বর্ণ শিখি : চ ছ জ ঝ ঞ"),
  p(20, "আ-কার শিখি"),
  p(21, "ই-কার ঈ-কার শিখি"),
  p(22, "বর্ণ শিখি : ট ঠ ড ঢ ণ"),
  p(23, "বর্ণ শিখি : ত থ দ ধ ন"),
  p(24, "ট্রেন"),
  p(25, "বর্ণ শিখি : প ফ ব ভ ম"),
  p(26, "উ-কার ঊ-কার শিখি"),
  p(27, "ঋ-কার এ-কার শিখি"),
  p(28, "এ-কার ঐ-কার শিখি"),
  p(29, "বর্ণ শিখি : য র ল"),
  p(30, "ও-কার ঔ-কার শিখি"),
  p(31, "বর্ণ শিখি : শ ষ স হ"),
  p(32, "বর্ণ শিখি : ড় ঢ় য়"),
  p(33, "বর্ণ শিখি : ৎ ং ঃ"),
  p(34, "ছবি দেখি শব্দ বানাই"),
  p(35, "এসো পড়ি ও লিখি"),
  p(36, "এসো পড়ি ও লিখি"),
  p(37, "এসো পড়ি ও লিখি"),
  p(38, "রাজকুমার"),
  p(39, "ব্যঞ্জনবর্ণ", 55, 63, 2),
  p(40, "মামার বাড়ি"),
  p(41, "তুলির ছবি"),
  p(42, "ভোর হলো"),
  p(43, "পড়ি ও লিখি"),
  p(44, "যেতে যেতে পড়ি"),
  p(45, "সাত দিনের কথা"),
  p(46, "পিঁপড়া ও পায়রার গল্প"),
  p(47, "আজকের দিন"),
  p(48, "ছুটি"),
  p(49, "আমাদের দেশ"),
  p(50, "মাছের রাজা"),
  p(51, "সংখ্যায় শিখি"),
  p(52, "আমাদের মুক্তিযুদ্ধ"),
  p(53, "শব্দ নিয়ে খেলা"),
  p(54, "আমার ঠিকানা"),
];

export function previewUrl(driveFileId: string = NCTB_CLASS1_BN.driveFileId): string {
  return `https://drive.google.com/file/d/${driveFileId}/preview`;
}

/** Map integrity: 54 পাঠ numbered 1..54, sane page/pdf ranges. */
export function validateNctbMap(paths: NctbPath[] = NCTB_PATHS): string[] {
  const issues: string[] = [];
  if (paths.length !== 54) issues.push(`expected 54 paths, got ${paths.length}`);
  paths.forEach((x, i) => {
    if (x.no !== i + 1) issues.push(`path #${x.no} out of order at index ${i}`);
    if (!x.title.trim()) issues.push(`path #${x.no}: missing title`);
    if (x.pdf !== undefined && (x.pdf < 0 || x.pdf >= NCTB_CLASS1_BN.pdfPages)) {
      issues.push(`path #${x.no}: pdf index out of range`);
    }
    if (x.v === 2 && (x.page === undefined || x.pdf === undefined)) {
      issues.push(`path #${x.no}: v2 needs page + pdf`);
    }
    if (x.pdf !== undefined && x.page !== undefined && x.pdf !== x.page + NCTB_CLASS1_BN.pdfOffset) {
      issues.push(`path #${x.no}: pdf/page offset broken`);
    }
  });
  return issues;
}
