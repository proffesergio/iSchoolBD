"use client";
import { useState } from "react";
import type { MinimalCourse } from "@/lib/minimal/types";

type TabId = "overview" | "qa" | "resources";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "qa", label: "Q&A" },
  { id: "resources", label: "Resources" },
];

/**
 * View B — Tabbed navigation below the player
 * (Overview / Q&A / Resources).
 */
export function PlayerTabs({ course }: { course: MinimalCourse }) {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <div className="mt-4 rounded-lg border border-hairline bg-white">
      <div role="tablist" aria-label="Lecture details" className="flex gap-2 border-b border-hairline px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const i = TABS.findIndex((x) => x.id === active);
                const next = e.key === "ArrowRight"
                  ? TABS[(i + 1) % TABS.length]
                  : TABS[(i - 1 + TABS.length) % TABS.length];
                setActive(next.id);
              }
            }}
            className={`px-4 py-2 text-[16px] font-semibold ${
              active === t.id
                ? "border-b-2 border-indigoaccent text-indigoaccent"
                : "text-mutedslate"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-4 md:p-6">
        {active === "overview" && (
          <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
            <h3 className="minimal-h3">About this course</h3>
            <p className="minimal-body mt-2">{course.overview}</p>
            <p className="mt-2 text-[14px] text-mutedslate">
              Instructor: <strong className="text-charcoal">{course.instructor}</strong> ·{" "}
              {course.enrollment}
            </p>
          </div>
        )}
        {active === "qa" && (
          <div role="tabpanel" id="panel-qa" aria-labelledby="tab-qa">
            <h3 className="minimal-h3">Questions & answers</h3>
            <ul className="mt-2 space-y-4">
              <li className="rounded-lg border border-hairline p-4">
                <p className="text-[16px] font-semibold text-charcoal">
                  Will this prepare me for the board exam?
                </p>
                <p className="minimal-body mt-2">
                  Yes — each module maps to the syllabus topics, and the resources
                  include past-paper style practice.
                </p>
              </li>
              <li className="rounded-lg border border-hairline p-4">
                <p className="text-[16px] font-semibold text-charcoal">
                  Do I need anything installed?
                </p>
                <p className="minimal-body mt-2">
                  No. All lessons play in the browser; downloads are optional.
                </p>
              </li>
            </ul>
          </div>
        )}
        {active === "resources" && (
          <div role="tabpanel" id="panel-resources" aria-labelledby="tab-resources">
            <h3 className="minimal-h3">Downloadable resources</h3>
            <ul className="mt-2 space-y-2">
              {course.resources.map((r) => (
                <li key={r}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-2 rounded-lg border border-hairline p-4 text-[16px] text-charcoal hover:border-indigoaccent"
                  >
                    <span aria-hidden="true">📎</span> {r}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
