/**
 * Sprint 2 kickoff — Class 1 content batch 1, delivered through the admin
 * control plane (the new system pattern: content flows via API, not code).
 *
 * Usage:
 *   ADMIN_API_KEY=xxx API_BASE=https://<api-url>/api node scripts/seed-sprint2-class1.mjs
 *   # local: ADMIN_API_KEY=dev-key API_BASE=http://localhost:3001/api node scripts/seed-sprint2-class1.mjs
 */
const BASE = process.env.API_BASE ?? "http://localhost:3001/api";
const KEY = process.env.ADMIN_API_KEY;
if (!KEY) {
  console.error("Set ADMIN_API_KEY env first (see docs/ADMIN.md).");
  process.exit(1);
}

async function put(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${path} -> ${r.status}: ${await r.text()}`);
  return r.json();
}

const CHAPTERS = [
  { id: "c1-bn-shobdo", courseId: "c1-bangla", titleBn: "শব্দ গঠন", titleEn: "Word building" },
  { id: "c1-ma-sub", courseId: "c1-math", titleBn: "বিয়োগ পরিচিতি", titleEn: "Meet subtraction" },
  { id: "c1-en-num", courseId: "c1-english", titleBn: "Numbers & colors", titleEn: "Numbers and colors" },
];

const LESSONS = [
  // শব্দ গঠন
  { id: "c1-bn-sh-1", chapterId: "c1-bn-shobdo", titleBn: "অক্ষর জোড়া", titleEn: "Join letters", kind: "interactive", xp: 10 },
  { id: "c1-bn-sh-2", chapterId: "c1-bn-shobdo", titleBn: "শব্দ ভিডিও", titleEn: "Word video", kind: "video", xp: 10 },
  { id: "c1-bn-sh-3", chapterId: "c1-bn-shobdo", titleBn: "শব্দ কুইজ", titleEn: "Word quiz", kind: "quiz", xp: 15 },
  // বিয়োগ
  { id: "c1-ma-su-1", chapterId: "c1-ma-sub", titleBn: "নেওয়া শেখো", titleEn: "Take away", kind: "interactive", xp: 10 },
  { id: "c1-ma-su-2", chapterId: "c1-ma-sub", titleBn: "বিয়োগ ভিডিও", titleEn: "Subtraction video", kind: "video", xp: 10 },
  { id: "c1-ma-su-3", chapterId: "c1-ma-sub", titleBn: "বিয়োগ কুইজ", titleEn: "Subtraction quiz", kind: "quiz", xp: 15 },
  // Numbers & colors
  { id: "c1-en-nu-1", chapterId: "c1-en-num", titleBn: "One, Two, Three", titleEn: "One two three", kind: "interactive", xp: 10 },
  { id: "c1-en-nu-2", chapterId: "c1-en-num", titleBn: "Colors video", titleEn: "Colors video", kind: "video", xp: 10 },
  { id: "c1-en-nu-3", chapterId: "c1-en-num", titleBn: "Numbers quiz", titleEn: "Numbers quiz", kind: "quiz", xp: 15 },
];

for (const ch of CHAPTERS) {
  const out = await put("/admin/chapters", ch);
  console.log("chapter:", out.id);
}
for (const l of LESSONS) {
  const out = await put("/admin/lessons", l);
  console.log("lesson:", out.id);
}
console.log("Sprint 2 batch 1 seeded: 3 chapters, 9 lessons.");
