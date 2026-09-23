import Link from "next/link";
import { CURRICULUM, SUBJECT_META, type ClassId } from "../../lib/curriculum";
import { DailyMission } from "../../components/engage/DailyMission";
import { BadgeCabinet } from "../../components/engage/BadgeCabinet";

export const metadata = { title: "Courses — iSchool" };

const CLASSES: { id: ClassId; bn: string; emoji: string; color: string }[] = [
  { id: "class-1", bn: "১ম শ্রেণি", emoji: "🌱", color: "#22b07d" },
  { id: "class-2", bn: "২য় শ্রেণি", emoji: "🌿", color: "var(--cos-cyan)" },
  { id: "class-3", bn: "৩য় শ্রেণি", emoji: "🚀", color: "var(--cos-violet)" },
];

export default function CoursesPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <h1>📚 কোর্স</h1>
      <p style={{ opacity: 0.75 }}>শ্রেণি বেছে নাও — তারপর বই, তারপর অধ্যায়। প্রতিটা অধ্যায়ে কুইজ! 🎯</p>

      <DailyMission />

      <h2>শ্রেণি</h2>
      <div className="grid" style={{ padding: 0 }}>
        {CLASSES.map((c) => {
          const books = CURRICULUM.filter((x) => x.classId === c.id);
          const chapters = books.reduce((n, b) => n + b.chapters.length, 0);
          return (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit", fontSize: 40, borderTop: `6px solid ${c.color}` }}
            >
              {c.emoji}
              <small style={{ fontSize: 20, fontWeight: 900 }}>{c.bn}</small>
              <small style={{ fontSize: 13, opacity: 0.7 }}>{books.length} বই · {chapters} অধ্যায়</small>
            </Link>
          );
        })}
      </div>

      <h2>🏅 ব্যাজ ক্যাবিনেট</h2>
      <BadgeCabinet />

      <p style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link className="btn primary" href="/leaderboard">🏆 লিডারবোর্ড</Link>
        <Link className="btn ghost" href="/books">📖 পাঠ্যবই</Link>
      </p>
    </main>
  );
}
