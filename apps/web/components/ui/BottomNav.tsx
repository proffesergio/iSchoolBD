"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type ShellTab = "home" | "courses" | "search" | "videos" | "profile";

const TABS: { id: ShellTab; href: string; emoji: string; labelBn: string; labelEn: string }[] = [
  { id: "home", href: "/", emoji: "🏠", labelBn: "হোম", labelEn: "Home" },
  { id: "courses", href: "/courses", emoji: "📚", labelBn: "কোর্স", labelEn: "Courses" },
  { id: "search", href: "/search", emoji: "🔍", labelBn: "খুঁজো", labelEn: "Search" },
  { id: "videos", href: "/videos", emoji: "🎬", labelBn: "ভিডিও", labelEn: "Videos" },
  { id: "profile", href: "/profile", emoji: "👧", labelBn: "প্রোফাইল", labelEn: "Profile" },
];

function tabForPath(pathname: string | null): ShellTab {
  if (!pathname) return "home";
  const hit = TABS.find((t) => (t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)));
  return hit?.id ?? "home";
}

/** Mobile-first bottom navigation. Desktop renders as a slim top bar via CSS. */
export function BottomNav() {
  const pathname = usePathname();
  const active = tabForPath(pathname);
  return (
    <nav className="bottomnav" aria-label="Primary">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={active === t.id ? "page" : undefined}
          className={active === t.id ? "bottomnav-item active" : "bottomnav-item"}
        >
          <span className="bottomnav-emoji" aria-hidden="true">{t.emoji}</span>
          <span className="bottomnav-label">{t.labelBn}</span>
        </Link>
      ))}
    </nav>
  );
}
