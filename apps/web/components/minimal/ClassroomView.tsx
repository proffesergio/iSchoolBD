"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { MinimalCourse } from "@/lib/minimal/types";
import { SyllabusSidebar } from "./SyllabusSidebar";
import { PlayerTabs } from "./PlayerTabs";

/**
 * View B — Split-screen classroom (Udemy style).
 * Two-column flex under `100vh - 64px`: left player (70%) with
 * 16:9 frame + tabs, right syllabus sidebar (30%, scrollable).
 */
export function ClassroomView({ course }: { course: MinimalCourse }) {
  const flat = useMemo(
    () => course.modules.flatMap((m) => m.lectures.map((l) => ({ module: m, lecture: l }))),
    [course]
  );
  const [activeLectureId, setActiveLectureId] = useState(flat[0]?.lecture.id ?? "");
  const active = flat.find((f) => f.lecture.id === activeLectureId) ?? flat[0];

  return (
    <div className="minimal-surface min-h-screen">
      <header className="border-b border-hairline bg-white">
        <nav
          aria-label="Classroom"
          className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 md:px-6"
        >
          <Link href="/browse" className="minimal-btn minimal-btn-ghost" aria-label="Back to courses">
            ← Courses
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold uppercase tracking-[0.08em] text-mutedslate">
              {course.category} · {course.level}
            </p>
            <h1 className="truncate text-[16px] font-semibold text-charcoal md:text-[20px]">
              {course.title}
            </h1>
          </div>
        </nav>
      </header>

      <main
        className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:flex-row"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <section aria-label="Lesson player" className="min-w-0 flex-1 lg:basis-[70%] lg:max-w-[70%]">
          <div
            className="overflow-hidden rounded-lg border border-hairline bg-charcoal"
            style={{ aspectRatio: "16 / 9" }}
            role="img"
            aria-label={`Now playing: ${active?.lecture.title ?? "lecture"}`}
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
              <p className="text-[32px]" aria-hidden="true">
                {active?.lecture.kind === "document" ? "📄" : "▶"}
              </p>
              <p className="text-[20px] font-semibold text-white">
                {active?.lecture.title ?? "Select a lecture"}
              </p>
              <p className="text-[14px] text-white/70">
                {active ? `${active.module.title} · ${active.lecture.duration}` : ""}
              </p>
              <p className="text-[12px] text-white/50">
                Video frame placeholder — wire to /videos player or embed URL
              </p>
            </div>
          </div>
          <PlayerTabs course={course} />
        </section>

        <div className="min-w-0 lg:basis-[30%] lg:max-w-[30%]">
          <div className="lg:sticky lg:top-[80px] lg:h-[calc(100vh-64px-64px)]">
            <SyllabusSidebar
              modules={course.modules}
              activeLectureId={activeLectureId}
              onSelectLecture={setActiveLectureId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
