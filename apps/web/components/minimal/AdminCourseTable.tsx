"use client";
import { useDropdown } from "@/lib/minimal/hooks";
import type { AdminCourseRow } from "@/lib/minimal/types";

function StatusBadge({ status }: { status: AdminCourseRow["status"] }) {
  const published = status === "Published";
  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] ${
        published ? "bg-[#E6F7EC] text-[#15803D]" : "bg-[#FEF3C7] text-[#92400E]"
      }`}
    >
      {status}
    </span>
  );
}

function RowMenu({
  row,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  row: AdminCourseRow;
  onEdit: (row: AdminCourseRow) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}) {
  const { isOpen, setIsOpen, triggerRef, menuRef } = useDropdown(false);
  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Actions for ${row.title}`}
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-lg border border-hairline bg-white px-4 py-2 text-[16px] text-charcoal"
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${row.title}`}
          className="absolute right-0 top-[48px] z-20 w-[200px] rounded-lg border border-hairline bg-white p-2 shadow-[0_8px_24px_rgba(17,24,39,0.08)]"
        >
          <button
            role="menuitem"
            className="block w-full rounded-lg px-4 py-2 text-left text-[16px] text-charcoal hover:bg-canvas"
            onClick={() => {
              onEdit(row);
              setIsOpen(false);
            }}
          >
            ✎ Edit
          </button>
          <button
            role="menuitem"
            className="block w-full rounded-lg px-4 py-2 text-left text-[16px] text-charcoal hover:bg-canvas"
            onClick={() => {
              onToggleStatus(row.id);
              setIsOpen(false);
            }}
          >
            {row.status === "Published" ? "📝 Unpublish" : "🚀 Publish"}
          </button>
          <button
            role="menuitem"
            className="block w-full rounded-lg px-4 py-2 text-left text-[16px] text-[#B91C1C] hover:bg-canvas"
            onClick={() => {
              onDelete(row.id);
              setIsOpen(false);
            }}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * View C — Course management data table.
 * Rows: thumbnail, title, category, student count, status badge,
 * action ellipsis menu (Edit / Publish toggle / Delete).
 */
export function AdminCourseTable({
  rows,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  rows: AdminCourseRow[];
  onEdit: (row: AdminCourseRow) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p role="status" className="rounded-lg border border-hairline bg-white p-8 text-center text-[16px] text-mutedslate">
        No courses yet. Use “Create New Course” to add your first one.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline bg-white">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline">
            <th scope="col" className="px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-mutedslate">Course</th>
            <th scope="col" className="px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-mutedslate">Category</th>
            <th scope="col" className="px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-mutedslate">Students</th>
            <th scope="col" className="px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-mutedslate">Status</th>
            <th scope="col" className="px-4 py-2 text-right text-[12px] font-bold uppercase tracking-[0.06em] text-mutedslate">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-hairline last:border-0">
              <td className="px-4 py-2">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[12px] font-bold text-charcoal"
                    style={{
                      background: `linear-gradient(135deg, hsl(${row.thumbnailHue} 60% 92%), hsl(${row.thumbnailHue} 55% 78%))`,
                      aspectRatio: "16 / 9",
                    }}
                  >
                    {row.thumbnailLabel.slice(0, 6)}
                  </span>
                  <span className="text-[16px] font-semibold text-charcoal">{row.title}</span>
                </div>
              </td>
              <td className="px-4 py-2 text-[16px] text-mutedslate">{row.category}</td>
              <td className="px-4 py-2 text-[16px] tabular-nums text-charcoal">
                {row.students.toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-2 text-right">
                <RowMenu
                  row={row}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
