import { notFound } from "next/navigation";
import { CURRICULUM, type ClassId, type CoreSubject } from "../../../../../lib/curriculum";
import { ChapterDetail } from "./chapter-detail";

export default function ChapterPage({ params }: { params: { classId: string; subject: string; chapterId: string } }) {
  const course = CURRICULUM.find(
    (c) => c.classId === (params.classId as ClassId) && c.subject === (params.subject as CoreSubject)
  );
  const chapter = course?.chapters.find((ch) => ch.id === params.chapterId);
  if (!course || !chapter) notFound();
  return <ChapterDetail classId={course.classId} subject={course.subject} chapter={chapter} />;
}
