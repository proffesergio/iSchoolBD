"use client";
import { useAccordion } from "@/lib/minimal/hooks";
import type { MinimalModule } from "@/lib/minimal/types";

interface SyllabusSidebarProps {
  modules: MinimalModule[];
  activeLectureId: string;
  onSelectLecture: (lectureId: string) => void;
}

/**
 * View B — Syllabus Sidebar (30% pane).
 * Fixed-height scrollable column; each section is an accordion
 * revealing a vertical sequence of lectures (icon + title + duration).
 */
export function SyllabusSidebar({ modules, activeLectureId, onSelectLecture }: SyllabusSidebarProps) {
  const { toggleSection, isSectionOpen } = useAccordion(
    modules.length > 0 ? [modules[0].id] : []
  );

  return (
    <aside
      aria-label="Course syllabus"
      className="flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-white"
    >
      <h2 className="border-b border-hairline p-4 text-[20px] font-semibold text-charcoal">
        Syllabus
      </h2>
      <div className="flex-1 overflow-y-auto p-2" role="list">
        {modules.map((mod, idx) => {
          const open = isSectionOpen(mod.id);
          const panelId = `section-panel-${mod.id}`;
          return (
            <div key={mod.id} role="listitem" className="mb-2 rounded-lg border border-hairline">
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleSection(mod.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSection(mod.id);
                    }
                  }}
                  className="flex w-full items-center gap-2 p-4 text-left"
                >
                  <span aria-hidden="true" className="text-[12px] text-mutedslate">
                    {open ? "▼" : "▶"}
                  </span>
                  <span className="flex-1 text-[16px] font-semibold text-charcoal">
                    <span className="mr-2 text-[12px] font-bold uppercase tracking-wide text-mutedslate">
                      Section {idx + 1}
                    </span>
                    {mod.title}
                  </span>
                  <span className="text-[14px] text-mutedslate">
                    {mod.lectures.length} lectures
                  </span>
                </button>
              </h3>
              {open && (
                <ul id={panelId} className="border-t border-hairline">
                  {mod.lectures.map((lec) => {
                    const active = lec.id === activeLectureId;
                    return (
                      <li key={lec.id}>
                        <button
                          type="button"
                          onClick={() => onSelectLecture(lec.id)}
                          aria-current={active ? "true" : undefined}
                          className={`flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-canvas ${
                            active ? "bg-canvas font-semibold" : ""
                          }`}
                        >
                          <span aria-hidden="true" className="w-6 text-center text-[16px]">
                            {lec.kind === "video" ? "▶" : "📄"}
                          </span>
                          <span className="flex-1 text-[16px] leading-[1.6] text-charcoal">
                            {lec.title}
                          </span>
                          <span className="shrink-0 text-[14px] text-mutedslate">
                            {lec.duration}
                          </span>
                          {active && (
                            <span aria-hidden="true" className="text-[14px] text-indigoaccent">●</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
