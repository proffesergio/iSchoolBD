"use client";
import { useMemo, useState } from "react";
import { MINIMAL_COURSES } from "@/lib/minimal/catalog";
import { addCourseRow, deleteCourseRow, toggleCourseStatus } from "@/lib/minimal/admin-mutations";
import { toAdminRow, type AdminCourseRow } from "@/lib/minimal/types";
import { AdminSidebar, type ManageSection } from "@/components/minimal/AdminSidebar";
import { AdminCourseTable } from "@/components/minimal/AdminCourseTable";
import { CourseWizard } from "@/components/minimal/CourseWizard";

const INITIAL_ROWS: AdminCourseRow[] = MINIMAL_COURSES.map(toAdminRow);

/**
 * View C — Real-time admin management panel.
 * Sidebar (240px) + header with "Create New Course" CTA +
 * data table + creation wizard. Mutations are local-state
 * array operations simulating real-time updates.
 */
export default function ManagePage() {
  const [section, setSection] = useState<ManageSection>("courses");
  const [rows, setRows] = useState<AdminCourseRow[]>(INITIAL_ROWS);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCourseRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const published = useMemo(() => rows.filter((r) => r.status === "Published").length, [rows]);
  const totalStudents = useMemo(() => rows.reduce((n, r) => n + r.students, 0), [rows]);

  function handleAddCourse(row: AdminCourseRow) {
    setRows((prev) => addCourseRow(prev, row));
    setNotice(`Course “${row.title}” saved (${row.status}).`);
    setWizardOpen(false);
    setEditing(null);
  }

  function handleDeleteCourse(id: string) {
    const target = rows.find((r) => r.id === id);
    if (target && !window.confirm(`Delete “${target.title}”?`)) return;
    setRows((prev) => deleteCourseRow(prev, id));
    setNotice(`Course deleted.`);
  }

  function handleStatusToggle(id: string) {
    setRows((prev) => toggleCourseStatus(prev, id));
    const target = rows.find((r) => r.id === id);
    if (target) {
      setNotice(
        `“${target.title}” is now ${target.status === "Published" ? "Draft" : "Published"}.`
      );
    }
  }

  function openCreate() {
    setEditing(null);
    setWizardOpen(true);
  }

  return (
    <div className="minimal-surface min-h-screen">
      <a href="#manage-main" className="skip-link">
        Skip to management table
      </a>
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col md:flex-row">
        <AdminSidebar active={section} onNavigate={setSection} />
        <main id="manage-main" className="minimal-canvas min-w-0 flex-1 p-4 md:p-6">
          {section === "courses" && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="minimal-h1">Course Manager</h1>
                  <p className="minimal-body mt-2">
                    {rows.length} courses · {published} published ·{" "}
                    {totalStudents.toLocaleString()} students
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreate}
                  className="minimal-btn minimal-btn-primary"
                >
                  ＋ Create New Course
                </button>
              </div>

              {notice && (
                <p role="status" className="mb-4 rounded-lg bg-[#E6F7EC] p-4 text-[16px] text-[#15803D]">
                  {notice}
                </p>
              )}

              {wizardOpen && (
                <div className="mb-6">
                  <CourseWizard
                    initial={editing}
                    onSubmit={(row) => handleAddCourse(row)}
                    onCancel={() => {
                      setWizardOpen(false);
                      setEditing(null);
                    }}
                  />
                </div>
              )}

              <AdminCourseTable
                rows={rows}
                onEdit={(row) => {
                  setEditing(row);
                  setWizardOpen(true);
                }}
                onDelete={handleDeleteCourse}
                onToggleStatus={handleStatusToggle}
              />
            </>
          )}

          {section === "overview" && (
            <>
              <h1 className="minimal-h1">Dashboard Overview</h1>
              <p className="minimal-body mt-2">Platform at a glance.</p>
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                {[
                  { label: "Total courses", value: String(rows.length) },
                  { label: "Published", value: String(published) },
                  { label: "Students", value: totalStudents.toLocaleString() },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-hairline bg-white p-6">
                    <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-mutedslate">
                      {s.label}
                    </p>
                    <p className="mt-2 text-[31.25px] font-bold tracking-[-0.02em] text-charcoal">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === "users" && (
            <>
              <h1 className="minimal-h1">User Access</h1>
              <p className="minimal-body mt-2">
                Roles are simulated here. Connect to /admin for the live student roster.
              </p>
              <div className="mt-4 rounded-lg border border-hairline bg-white p-6">
                <ul className="space-y-2 text-[16px] text-charcoal">
                  <li>👩‍🏫 Instructors — create and edit courses</li>
                  <li>🧑‍🎓 Students — enroll and track progress</li>
                  <li>🛡 Admins — publish, archive, delete</li>
                </ul>
              </div>
            </>
          )}

          {section === "settings" && (
            <>
              <h1 className="minimal-h1">Settings</h1>
              <p className="minimal-body mt-2">Minimal preferences for this surface.</p>
              <div className="mt-4 rounded-lg border border-hairline bg-white p-6">
                <p className="text-[16px] text-charcoal">
                  Accent: Deep Indigo #4F46E5 · Type scale 1.25 · Spacing 8px grid
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
