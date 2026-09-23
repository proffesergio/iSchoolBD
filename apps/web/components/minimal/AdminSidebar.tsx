"use client";
import Link from "next/link";

export type ManageSection = "overview" | "courses" | "users" | "settings";

const LINKS: { id: ManageSection; label: string; icon: string }[] = [
  { id: "overview", label: "Dashboard Overview", icon: "▦" },
  { id: "courses", label: "Course Manager", icon: "📚" },
  { id: "users", label: "User Access", icon: "👥" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

/**
 * View C — Sidebar-driven layout. Fixed 240px left nav.
 */
export function AdminSidebar({
  active,
  onNavigate,
}: {
  active: ManageSection;
  onNavigate: (s: ManageSection) => void;
}) {
  return (
    <aside
      aria-label="Admin navigation"
      className="w-full shrink-0 border-b border-hairline bg-white p-4 md:w-[240px] md:border-b-0 md:border-r md:p-6"
    >
      <Link
        href="/browse"
        className="mb-6 flex items-center gap-2 text-[20px] font-semibold text-charcoal"
        aria-label="Back to site"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigoaccent text-[16px] font-bold text-white"
        >
          iS
        </span>
        Admin
      </Link>
      <nav aria-label="Management sections">
        <ul className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {LINKS.map((l) => (
            <li key={l.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onNavigate(l.id)}
                aria-current={active === l.id ? "page" : undefined}
                className={`flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-[16px] ${
                  active === l.id
                    ? "bg-indigoaccent font-semibold text-white"
                    : "text-charcoal hover:bg-canvas"
                }`}
              >
                <span aria-hidden="true" className="w-6 text-center">{l.icon}</span>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-6 hidden text-[14px] leading-[1.6] text-mutedslate md:block">
        Minimal admin surface. Changes simulate in real time via local state.
      </p>
    </aside>
  );
}
