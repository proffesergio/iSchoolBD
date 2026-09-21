/**
 * Rotating hero headlines — one platform, every childhood.
 * Universal lines for guests, class-aware lines for logged-in students.
 * Order is shuffled (no repeat until the pool cycles) for the
 * "randomization in between" feel; animation is pure CSS keyed on index.
 */

export interface Headline {
  text: string;
  lang: "bn" | "en" | "mix";
}

export const UNIVERSAL_HEADLINES: Headline[] = [
  { text: "শৈশব থেকে মহাকাশ 🚀", lang: "bn" },
  { text: "Learning Beyond the Sky ✨", lang: "en" },
  { text: "খেলতে খেলতে শেখো 🎮", lang: "bn" },
  { text: "অ-আ থেকে A-Z 🌈", lang: "mix" },
  { text: "Every Child, Every Dream 🌟", lang: "en" },
  { text: "প্রথম বর্ণ থেকে প্রথম রকেট 🛸", lang: "bn" },
  { text: "Where Curiosity Takes Flight 🪁", lang: "en" },
  { text: "স্বপ্ন বড়, শেখা মজার 💫", lang: "bn" },
];

/** Class-aware lines appended when a student is logged in. */
export function classHeadlines(studentName: string, little: boolean): Headline[] {
  if (little) {
    return [
      { text: `${studentName}, আজ খেলতে খেলতে শিখি! 🌱`, lang: "bn" },
      { text: `${studentName}-এর বর্ণ-অভিযান 🧸`, lang: "bn" },
    ];
  }
  return [
    { text: `${studentName}-এর আজকের মিশন 🎯`, lang: "bn" },
    { text: `${studentName}, Explorer Mode ON 🛰️`, lang: "mix" },
  ];
}

/** Fisher–Yates with injectable randomness (tests pass a stub). */
export function shuffled<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
