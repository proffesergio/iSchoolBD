import type { MinimalCourse } from "./types";

/**
 * Minimal catalog bridging the existing NCTB foundation (Class 1–3)
 * with the class levels requested in the spec (Grade 9 / Grade 10 /
 * SAT Prep / Web Development). Thumbnails are gradient placeholders
 * (no external images) so the grid works offline and in tests.
 */

export const CLASS_LEVELS = ["Grade 9", "Grade 10", "SAT Prep", "Web Development"] as const;

export const CATEGORIES = [
  "All",
  "Mathematics",
  "Science",
  "English",
  "Bangla",
  "SAT Prep",
  "Web Development",
] as const;

function lectures(prefix: string, titles: string[]): { id: string; title: string; kind: "video" | "document"; duration: string }[] {
  return titles.map((title, i) => ({
    id: `${prefix}-l${i + 1}`,
    title,
    kind: i % 4 === 3 ? ("document" as const) : ("video" as const),
    duration: `${4 + ((i * 3) % 12)}:${((i * 17) % 60).toString().padStart(2, "0")}`,
  }));
}

export const MINIMAL_COURSES: MinimalCourse[] = [
  {
    id: "grade-9-math",
    category: "Mathematics",
    level: "Grade 9",
    title: "Grade 9 Mathematics: Algebra Foundations and Linear Equations",
    instructor: "Nusrat Jahan",
    rating: 4.8,
    ratingsCount: 2314,
    price: "৳850",
    enrollment: "12,400 students",
    students: 12400,
    status: "Published",
    thumbnailLabel: "Algebra",
    thumbnailHue: 238,
    overview:
      "A calm, structured path through Grade 9 algebra: expressions, linear equations, and word problems. Each module ends with a short check-in so you always know what stuck.",
    resources: ["Algebra formula sheet (PDF)", "Practice set 1–4 with solutions", "Glossary: EN ↔ BN terms"],
    modules: [
      { id: "g9m-1", title: "Expressions and Polynomials", lectures: lectures("g9m-1", ["Variables and terms", "Adding polynomials", "Worksheet walkthrough (PDF)"]) },
      { id: "g9m-2", title: "Linear Equations", lectures: lectures("g9m-2", ["One-variable equations", "Two-variable systems", "Word problems", "Chapter quiz review"]) },
      { id: "g9m-3", title: "Graphs and Slope", lectures: lectures("g9m-3", ["Coordinate plane", "Slope and intercepts", "Graphing lines"]) },
    ],
  },
  {
    id: "grade-10-physics",
    category: "Science",
    level: "Grade 10",
    title: "Grade 10 Physics: Motion, Force, and Energy Explained Simply",
    instructor: "Tanvir Ahmed",
    rating: 4.7,
    ratingsCount: 1892,
    price: "৳950",
    enrollment: "9,800 students",
    students: 9800,
    status: "Published",
    thumbnailLabel: "Physics",
    thumbnailHue: 200,
    overview:
      "Motion, force, and energy with everyday examples and slow, visual explanations. Built for board exams and for genuine intuition.",
    resources: ["Motion diagrams pack", "Formula wall chart", "Past-paper question bank"],
    modules: [
      { id: "g10p-1", title: "Motion in a Straight Line", lectures: lectures("g10p-1", ["Speed vs velocity", "Acceleration graphs", "Numericals practice"]) },
      { id: "g10p-2", title: "Force and Newton’s Laws", lectures: lectures("g10p-2", ["First and second law", "Friction in daily life", "Free-body diagrams (PDF)"]) },
    ],
  },
  {
    id: "sat-prep-english",
    category: "SAT Prep",
    level: "SAT Prep",
    title: "SAT Reading & Writing: Strategy-First Prep for Busy Students",
    instructor: "Sarah Rahman",
    rating: 4.9,
    ratingsCount: 964,
    price: "Free",
    enrollment: "6,200 students",
    students: 6200,
    status: "Published",
    thumbnailLabel: "SAT",
    thumbnailHue: 265,
    overview:
      "Evidence-based reading tactics, grammar rules that actually repeat on the test, and timed drills. No fluff — every lecture maps to a question type.",
    resources: ["SAT vocab deck (300 words)", "Timed drill pack", "Essay planning template"],
    modules: [
      { id: "sat-1", title: "Reading Strategies", lectures: lectures("sat-1", ["Passage mapping", "Evidence pairs", "Timed drill 1"]) },
      { id: "sat-2", title: "Writing and Language", lectures: lectures("sat-2", ["Punctuation rules", "Concision and transitions", "Timed drill 2"]) },
    ],
  },
  {
    id: "web-dev-foundations",
    category: "Web Development",
    level: "Web Development",
    title: "Web Development Foundations: HTML, CSS, and Your First Site",
    instructor: "Arif Chowdhury",
    rating: 4.6,
    ratingsCount: 3421,
    price: "৳1,200",
    enrollment: "18,900 students",
    students: 18900,
    status: "Published",
    thumbnailLabel: "HTML·CSS",
    thumbnailHue: 160,
    overview:
      "From zero to a deployed personal site: semantic HTML, modern CSS layout, and accessibility basics. Project-based with readable code.",
    resources: ["Starter template (ZIP)", "Flexbox & Grid cheatsheet", "Accessibility checklist"],
    modules: [
      { id: "web-1", title: "HTML Essentials", lectures: lectures("web-1", ["Document structure", "Forms and semantics", "Project: profile page"]) },
      { id: "web-2", title: "CSS Layout", lectures: lectures("web-2", ["Box model", "Flexbox", "Grid", "Project: responsive gallery"]) },
      { id: "web-3", title: "Ship It", lectures: lectures("web-3", ["Accessibility pass", "Deploy walkthrough (PDF)"]) },
    ],
  },
  {
    id: "class-1-bangla",
    category: "Bangla",
    level: "Grade 9",
    title: "Bangla Foundations (Class 1–3 Bridge): স্বরবর্ণ থেকে গল্প",
    instructor: "Mitu Akter",
    rating: 4.9,
    ratingsCount: 5120,
    price: "Free",
    enrollment: "24,000 students",
    students: 24000,
    status: "Published",
    thumbnailLabel: "বাংলা",
    thumbnailHue: 340,
    overview:
      "Mirrors the existing NCTB Class 1–3 Bangla track: vowels, conjuncts, rhymes, and short stories. Connects directly to /courses for interactive practice.",
    resources: ["স্বরবর্ণ chart", "ছড়া audio pack", "Parent guide (BN)"],
    modules: [
      { id: "bn-1", title: "স্বরবর্ণ ও ব্যঞ্জনবর্ণ", lectures: lectures("bn-1", ["অ–ঔ চেনো", "ক–ঙ চেনো", "কুইজ"]) },
      { id: "bn-2", title: "যুক্তবর্ণ ও ছড়া", lectures: lectures("bn-2", ["যুক্তবর্ণ", "ছড়া শোনো", "কুইজ"]) },
    ],
  },
  {
    id: "class-2-math",
    category: "Mathematics",
    level: "Grade 10",
    title: "Primary Math Bridge: Counting to Two-Digit Addition",
    instructor: "Rahim Uddin",
    rating: 4.5,
    ratingsCount: 1876,
    price: "Free",
    enrollment: "15,300 students",
    students: 15300,
    status: "Draft",
    thumbnailLabel: "গণিত",
    thumbnailHue: 35,
    overview:
      "Bridges the Class 1–2 NCTB math curriculum into the Grade 9–10 track. Short lessons, big fonts, parent-friendly pacing.",
    resources: ["Counting cards", "Addition worksheet", "Progress tracker"],
    modules: [
      { id: "pm-1", title: "Counting and Place Value", lectures: lectures("pm-1", ["Count to 100", "Tens and ones", "Practice"]) },
      { id: "pm-2", title: "Addition and Subtraction", lectures: lectures("pm-2", ["Small sums", "Two-digit sums", "Quiz"]) },
    ],
  },
  {
    id: "grade-9-english",
    category: "English",
    level: "Grade 9",
    title: "Grade 9 English: Grammar and Reading for Board Exams",
    instructor: "Farhana Islam",
    rating: 4.7,
    ratingsCount: 1420,
    price: "৳750",
    enrollment: "8,100 students",
    students: 8100,
    status: "Published",
    thumbnailLabel: "English",
    thumbnailHue: 210,
    overview:
      "Tense, voice, narration, and unseen comprehension taught through board-style questions. Every rule gets an example sentence.",
    resources: ["Grammar rulebook", "Model answers", "Vocabulary by chapter"],
    modules: [
      { id: "g9e-1", title: "Grammar Core", lectures: lectures("g9e-1", ["Tense mastery", "Voice and narration", "Prepositions"]) },
      { id: "g9e-2", title: "Reading and Writing", lectures: lectures("g9e-2", ["Unseen passages", "Paragraph writing", "Application letters"]) },
    ],
  },
  {
    id: "sat-math-crash",
    category: "SAT Prep",
    level: "SAT Prep",
    title: "SAT Math Crash Course: Heart of Algebra and Problem Solving",
    instructor: "Imran Khan",
    rating: 4.8,
    ratingsCount: 733,
    price: "৳1,500",
    enrollment: "3,400 students",
    students: 3400,
    status: "Draft",
    thumbnailLabel: "SAT Math",
    thumbnailHue: 285,
    overview:
      "Twelve high-yield SAT math topics with calculator strategy and trap-answer training. Includes two full timed sections.",
    resources: ["Desmos quick guide", "Trap-answer log", "2 timed sections"],
    modules: [
      { id: "satm-1", title: "Heart of Algebra", lectures: lectures("satm-1", ["Linear systems sprint", "Inequalities", "Drill"]) },
      { id: "satm-2", title: "Problem Solving", lectures: lectures("satm-2", ["Ratios and percents", "Data analysis", "Timed section"]) },
    ],
  },
];

export function getMinimalCourse(id: string): MinimalCourse | undefined {
  return MINIMAL_COURSES.find((c) => c.id === id);
}

export function filterMinimalCourses(query: string, category: string, level?: string): MinimalCourse[] {
  const q = query.trim().toLowerCase();
  return MINIMAL_COURSES.filter((c) => {
    const matchesQuery =
      !q ||
      `${c.title} ${c.instructor} ${c.category} ${c.level}`.toLowerCase().includes(q);
    const matchesCategory = category === "All" || c.category === category;
    const matchesLevel = !level || level === "All levels" || c.level === level;
    return matchesQuery && matchesCategory && matchesLevel;
  });
}
