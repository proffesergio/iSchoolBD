import Link from "next/link";
import { CURRICULUM } from "../../lib/curriculum";

export const metadata = { title: "Courses — iSchool" };

export default function CoursesPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <h1>📚 কোর্স</h1>
      <p style={{ opacity: 0.75 }}>শ্রেণি আর বিষয় বেছে নাও — অধ্যায় খুলবে।</p>
      {CURRICULUM.map((c) => (
        <section key={`${c.classId}-${c.subject}`} style={{ marginBottom: 18 }}>
          <h2 className="section-title" style={{ padding: 0 }}>{c.titleBn}</h2>
          <p style={{ opacity: 0.7, margin: "2px 0 8px" }}>{c.titleEn}</p>
          {c.chapters.map((ch) => (
            <details key={ch.id} className="sheet" style={{ margin: "8px 0", textAlign: "left" }}>
              <summary style={{ fontWeight: 800, cursor: "pointer" }}>
                {ch.titleBn} <small style={{ opacity: 0.7 }}>({ch.lessons.length} পাঠ)</small>
              </summary>
              <ol>
                {ch.lessons.map((l) => (
                  <li key={l.id}>
                    {l.kind === "video" ? (
                      <Link href={`/videos?lesson=${l.id}`}>{l.titleBn}</Link>
                    ) : (
                      <Link href={`/?lesson=${l.id}`}>{l.titleBn}</Link>
                    )}{" "}
                    <small style={{ opacity: 0.65 }}>
                      {l.kind === "video" ? "🎬" : l.kind === "quiz" ? "❓" : "🎮"} +{l.xp} XP
                    </small>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </section>
      ))}
    </main>
  );
}
