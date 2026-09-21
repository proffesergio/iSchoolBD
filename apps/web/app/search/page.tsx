"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CURRICULUM } from "../../lib/curriculum";
import { VIDEO_CATALOG } from "../../lib/video-catalog";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return { lessons: [], courses: [] };
    const lessons = CURRICULUM.flatMap((c) =>
      c.chapters.flatMap((ch) =>
        ch.lessons
          .filter(
            (l) =>
              l.titleBn.includes(q.trim()) ||
              l.titleEn.toLowerCase().includes(needle) ||
              ch.titleBn.includes(q.trim())
          )
          .map((l) => ({ course: c, chapter: ch, lesson: l }))
      )
    ).slice(0, 30);
    const courses = VIDEO_CATALOG.filter(
      (c) => c.titleBn.includes(q.trim()) || c.titleEn.toLowerCase().includes(needle)
    );
    return { lessons, courses };
  }, [q]);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <h1>🔍 খুঁজো</h1>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="যোগ, Alphabet, গল্প…"
        aria-label="Search lessons and videos"
        style={{ width: "100%", padding: 12, fontSize: 17, borderRadius: 14, border: "3px solid var(--ink)" }}
      />
      {q.trim() !== "" && (
        <>
          <h2>পাঠ ({results.lessons.length})</h2>
          <ul>
            {results.lessons.map(({ course, lesson }) => (
              <li key={lesson.id}>
                <Link href={lesson.kind === "video" ? `/videos?lesson=${lesson.id}` : "/"}>{lesson.titleBn}</Link>{" "}
                <small style={{ opacity: 0.65 }}>{course.titleBn}</small>
              </li>
            ))}
          </ul>
          <h2>ভিডিও কোর্স ({results.courses.length})</h2>
          <ul>
            {results.courses.map((c) => (
              <li key={c.id}>
                <Link href={`/videos?course=${c.id}`}>{c.titleBn}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
