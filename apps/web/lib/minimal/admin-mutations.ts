import type { AdminCourseRow } from "./types";

/**
 * Pure admin-matrix mutations (tested in admin-mutations.test.ts).
 * The Manage page wraps these in `handleAddCourse` /
 * `handleDeleteCourse` / `handleStatusToggle` using local state.
 */

export function addCourseRow(rows: AdminCourseRow[], row: AdminCourseRow): AdminCourseRow[] {
  if (rows.some((r) => r.id === row.id)) {
    return rows.map((r) => (r.id === row.id ? row : r));
  }
  return [row, ...rows];
}

export function deleteCourseRow(rows: AdminCourseRow[], id: string): AdminCourseRow[] {
  return rows.filter((r) => r.id !== id);
}

export function toggleCourseStatus(rows: AdminCourseRow[], id: string): AdminCourseRow[] {
  return rows.map((r) =>
    r.id === id
      ? { ...r, status: r.status === "Published" ? "Draft" : "Published" }
      : r
  );
}

export function slugifyTitle(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `course-${Date.now().toString(36)}`
  );
}
