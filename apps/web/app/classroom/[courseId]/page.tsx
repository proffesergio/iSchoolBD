import { notFound } from "next/navigation";
import { getMinimalCourse, MINIMAL_COURSES } from "@/lib/minimal/catalog";
import { ClassroomView } from "@/components/minimal/ClassroomView";

export function generateStaticParams() {
  return MINIMAL_COURSES.map((c) => ({ courseId: c.id }));
}

export function generateMetadata({ params }: { params: { courseId: string } }) {
  const course = getMinimalCourse(params.courseId);
  return { title: course ? `${course.title} — Classroom` : "Classroom — iSchool" };
}

export default function ClassroomPage({ params }: { params: { courseId: string } }) {
  const course = getMinimalCourse(params.courseId);
  if (!course) notFound();
  return <ClassroomView course={course} />;
}
