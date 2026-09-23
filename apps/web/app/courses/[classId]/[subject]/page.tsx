import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, SUBJECT_META, type ClassId, type CoreSubject } from "@/lib/curriculum";
import { questionsFor } from "@/lib/chapter-quiz-bank";
import { ChapterList } from "./chapter-list";

export default function BookPage({ params }: { params: { classId: string; subject: string } }) {
  const classId = params.classId as ClassId;
  const subject = params.subject as CoreSubject;
  const course = getCourse(classId, subject);
  if (!course || !SUBJECT_META[subject]) notFound();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <p><Link href={`/courses/${classId}`}>← বই</Link></p>
      <h1>{SUBJECT_META[subject].emoji} {course.titleBn}</h1>
      <p style={{ opacity: 0.75 }}>{course.titleEn} — অধ্যায় শেষ করে কুইজে XP জেতো! 🏆</p>
      <ChapterList
        classId={classId}
        subject={subject}
        chapters={course.chapters.map((ch) => ({
          id: ch.id,
          titleBn: ch.titleBn,
          titleEn: ch.titleEn,
          lessons: ch.lessons.length,
          questions: questionsFor(ch.id).length,
        }))}
      />
    </main>
  );
}
