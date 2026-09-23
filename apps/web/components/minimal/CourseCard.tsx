import Link from "next/link";
import type { MinimalCourse } from "@/lib/minimal/types";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span role="img" aria-label={`Rated ${rating} out of 5`} className="text-[14px] tracking-tight text-[#B45309]">
      {"★".repeat(full)}
      <span aria-hidden="true" className="text-hairline">
        {"★".repeat(Math.max(0, 5 - full))}
      </span>
    </span>
  );
}

/**
 * View A — Course Card.
 * 16:9 thumbnail, 1px border, 8px radius, hover shadow.
 * Meta stack: Category tag → Title (2-line clamp) → Instructor →
 * Rating row → Price/Enrollment (bottom-aligned).
 */
export function CourseCard({ course }: { course: MinimalCourse }) {
  return (
    <article className="minimal-card flex h-full flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="minimal-thumb flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, hsl(${course.thumbnailHue} 60% 92%), hsl(${course.thumbnailHue} 55% 78%))`,
        }}
      >
        <span className="px-4 text-center text-[20px] font-semibold text-charcoal/80">
          {course.thumbnailLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mutedslate">
          {course.category} · {course.level}
        </p>
        <h3 className="text-[16px] font-semibold leading-snug text-charcoal">
          <Link
            href={`/classroom/${course.id}`}
            className="line-clamp-2 hover:text-indigoaccent hover:underline"
          >
            {course.title}
          </Link>
        </h3>
        <p className="text-[14px] leading-[1.6] text-mutedslate">{course.instructor}</p>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-charcoal">{course.rating.toFixed(1)}</span>
          <Stars rating={course.rating} />
          <span className="text-[14px] text-mutedslate">({course.ratingsCount.toLocaleString()})</span>
        </div>
        <div className="mt-auto flex items-baseline justify-between border-t border-hairline pt-2">
          <span className="text-[16px] font-bold text-charcoal">{course.price}</span>
          <span className="text-[14px] text-mutedslate">{course.enrollment}</span>
        </div>
      </div>
    </article>
  );
}
