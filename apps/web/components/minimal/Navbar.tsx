"use client";
import Link from "next/link";
import { useDropdown } from "@/lib/minimal/hooks";

interface NavbarProps {
  query: string;
  onQuery: (q: string) => void;
  category: string;
  onCategory: (c: string) => void;
  categories: readonly string[];
}

/**
 * View A — Global Navigation Bar.
 * Minimal 64px height, left logo, centered semantic search
 * (max-width 600px), Categories dropdown, right profile/notifications.
 */
export function Navbar({ query, onQuery, category, onCategory, categories }: NavbarProps) {
  const { isOpen, setIsOpen, triggerRef, menuRef } = useDropdown(false);

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-white">
      <a href="#browse-results" className="skip-link">
        Skip to courses
      </a>
      <nav
        aria-label="Global"
        className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 md:gap-6 md:px-6"
      >
        <Link
          href="/browse"
          className="flex shrink-0 items-center gap-2 text-[20px] font-semibold tracking-[-0.02em] text-charcoal"
          aria-label="iSchool home"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigoaccent text-[16px] font-bold text-white"
          >
            iS
          </span>
          iSchool
        </Link>

        <div className="relative hidden shrink-0 md:block">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls="categories-menu"
            onClick={() => setIsOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && !isOpen) {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
            className="minimal-btn minimal-btn-ghost"
          >
            Categories
            <span aria-hidden="true" className="text-[12px]">{isOpen ? "▲" : "▼"}</span>
          </button>
          {isOpen && (
            <div
              ref={menuRef}
              id="categories-menu"
              role="menu"
              aria-label="Course categories"
              className="absolute left-0 top-[48px] w-[240px] rounded-lg border border-hairline bg-white p-2 shadow-[0_8px_24px_rgba(17,24,39,0.08)]"
            >
              {categories.map((c) => (
                <button
                  key={c}
                  role="menuitemradio"
                  aria-checked={category === c}
                  onClick={() => {
                    onCategory(c);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      setIsOpen(false);
                      triggerRef.current?.focus();
                    }
                  }}
                  className={`block w-full rounded-lg px-4 py-2 text-left text-[16px] leading-[1.6] hover:bg-canvas ${
                    category === c ? "font-semibold text-indigoaccent" : "text-charcoal"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          role="search"
          aria-label="Search courses"
          className="mx-auto w-full max-w-[600px] flex-1"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="browse-search" className="sr-only">
            Search courses
          </label>
          <input
            id="browse-search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search courses, topics, instructors…"
            autoComplete="off"
            className="minimal-input"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-4">
          <button
            type="button"
            aria-label="Notifications, 3 unread"
            className="relative rounded-lg border border-hairline bg-white p-2 text-[16px] text-charcoal"
          >
            <span aria-hidden="true">🔔</span>
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigoaccent text-[10px] font-bold text-white"
            >
              3
            </span>
          </button>
          <button
            type="button"
            aria-label="Your profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight text-[14px] font-semibold text-white"
          >
            <span aria-hidden="true">ST</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
