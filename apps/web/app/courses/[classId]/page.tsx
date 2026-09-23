import Link from "next/link";
import { notFound } from "next/navigation";
import { CURRICULUM, SUBJECT_META, type ClassId, type CoreSubject } from "@/lib/curriculum";

const CLASS_BN: Record<ClassId, string> = {
  "class-1": "১ম শ্রেণি",
  "class-2": "২য় শ্রেণি",
  "class-3": "৩য় শ্রেণি",
};

const SUBJECT_ORDER: CoreSubject[] = ["bangla", "math", "english", "science"];

export default function ClassPage({ params }: { params: { classId: string } }) {
  const classId = params.classId as ClassId;
  if (!CLASS_BN[classId]) notFound();
  const books = CURRICULUM.filter((c) => c.classId === classId).sort(
    (a, b) => SUBJECT_ORDER.indexOf(a.subject) - SUBJECT_ORDER.indexOf(b.subject)
  );

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <p><Link href="/courses">← সব শ্রেণি</Link></p>
      <h1>📚 {CLASS_BN[classId]} — বই</h1>
      <p style={{ opacity: 0.75 }}>বই বেছে নাও — ভেতরে অধ্যায় আর কুইজ। 🎯</p>
      <div className="grid" style={{ padding: 0 }}>
        {books.map((b) => {
          const meta = SUBJECT_META[b.subject];
          const lessons = b.chapters.reduce((n, ch) => n + ch.lessons.length, 0);
          return (
            <Link
              key={b.subject}
              href={`/courses/${classId}/${b.subject}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit", fontSize: 40 }}
            >
              {meta.emoji}
              <small style={{ fontSize: 20, fontWeight: 900 }}>{meta.bn}</small>
              <small style={{ fontSize: 13, opacity: 0.7 }}>{b.chapters.length} অধ্যায় · {lessons} পাঠ</small>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
