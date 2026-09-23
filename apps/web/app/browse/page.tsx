"use client";
import { useMemo, useState } from "react";
import { CATEGORIES, filterMinimalCourses } from "@/lib/minimal/catalog";
import { Navbar } from "@/components/minimal/Navbar";
import { Hero } from "@/components/minimal/Hero";
import { CourseGrid } from "@/components/minimal/CourseGrid";

/**
 * View A — Minimal Student Dashboard & class-based course browser.
 * Navbar (64px) + Hero + auto-fill course matrix.
 */
export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [level, setLevel] = useState<string>("All levels");

  const courses = useMemo(
    () => filterMinimalCourses(query, category, level),
    [query, category, level]
  );

  return (
    <div className="minimal-surface min-h-screen">
      <Navbar
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        categories={CATEGORIES}
      />
      <main className="minimal-canvas">
        <Hero activeLevel={level} onSelectLevel={setLevel} resultCount={courses.length} />
        <div className="mx-auto max-w-[1200px] px-4 pb-12 md:px-6">
          <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Category filter">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`minimal-btn ${
                  category === c ? "minimal-btn-primary" : "minimal-btn-ghost"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <h2 className="minimal-h2 mb-4">
            {level === "All levels" ? "All courses" : level}
            <span className="ml-2 align-middle text-[16px] font-normal text-mutedslate">
              {courses.length} results
            </span>
          </h2>
          <CourseGrid courses={courses} />
        </div>
      </main>
    </div>
  );
}
