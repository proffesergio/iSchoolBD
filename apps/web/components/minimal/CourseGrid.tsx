import type { MinimalCourse } from "@/lib/minimal/types";
import { CourseCard } from "./CourseCard";

/**
 * View A — Course Grid Matrix.
 * `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
 */
export function CourseGrid({ courses }: { courses: MinimalCourse[] }) {
  if (courses.length === 0) {
    return (
      <p role="status" className="minimal-body rounded-lg border border-hairline bg-white p-8 text-center">
        No courses match your search. Try a different keyword or category.
      </p>
    );
  }
  return (
    <div
      id="browse-results"
      role="list"
      aria-label="Courses"
      className="minimal-grid-matrix"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
    >
      {courses.map((c) => (
        <div key={c.id} role="listitem" className="min-w-0">
          <CourseCard course={c} />
        </div>
      ))}
    </div>
  );
}
