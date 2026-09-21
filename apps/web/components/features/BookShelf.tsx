"use client";
import type { BookPageDef } from "../../lib/book-pages";
import { TRACK_BOOKS, pageTitle } from "../../lib/book-pages";
import { getTrack } from "../../lib/tracks";
import { useLearnerStore } from "../../lib/store";

interface BookShelfProps {
  pages: BookPageDef[];
  unlockedGated: string[];
  onOpen: (page: BookPageDef) => void;
  onOpenTrack: (trackId: string) => void;
}

/**
 * The bookshelf home — our web embodiment of the 62-page talking book.
 * Each card is one "page set": tap to open, 🔒 marks parent-gated pages,
 * ✅ counts buttons already touched-and-heard. Tier 2/3 study tracks
 * follow in their own "বড়দের পড়া" row.
 */
export function BookShelf({ pages, unlockedGated, onOpen, onOpenTrack }: BookShelfProps) {
  const listenedLetters = useLearnerStore((s) => s.listenedLetters);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list" aria-label="Talking book shelf">
        {pages.map((p) => {
          const heard = p.items.filter((it) => listenedLetters.includes(it.id)).length;
          const locked = p.gated === true && !unlockedGated.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              role="listitem"
              onClick={() => onOpen(p)}
              className="flex min-h-[150px] flex-col items-center justify-center gap-1 rounded-3xl border-[3px] border-ink bg-white px-2 py-3 shadow-[4px_4px_0_#16324f] transition-transform hover:scale-[1.03] active:translate-y-0.5"
            >
              <span className="text-5xl" role="img" aria-hidden="true">
                {locked ? "🔒" : p.cover}
              </span>
              <span className="font-bengali text-base font-black leading-tight">
                {pageTitle(p, "bn")}
              </span>
              <span className="font-bengali text-xs opacity-70">
                {p.titleEn} • {p.items.length} বোতাম
              </span>
              <span className="rounded-full border-2 border-ink bg-[#e6f4ec] px-2 text-xs font-extrabold">
                {heard > 0 ? `✅ ${heard}/${p.items.length}` : "👆 ছুঁয়ে শোনো"}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="section-title" style={{ marginTop: 18 }}>বড়দের পড়া 🚀 (Tier 2–3)</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list" aria-label="Study tracks">
        {TRACK_BOOKS.map((t) => {
          const track = getTrack(t.trackId);
          const total = track?.lessons.length ?? 0;
          const heard = track
            ? track.lessons.filter((l) => listenedLetters.includes(`lesson:${t.trackId}:${l.id}`)).length
            : 0;
          return (
            <button
              key={t.pageId}
              type="button"
              role="listitem"
              onClick={() => onOpenTrack(t.trackId)}
              className="flex min-h-[150px] flex-col items-center justify-center gap-1 rounded-3xl border-[3px] border-ink bg-[#fff7d6] px-2 py-3 shadow-[4px_4px_0_#16324f] transition-transform hover:scale-[1.03] active:translate-y-0.5"
            >
              <span className="text-5xl" role="img" aria-hidden="true">
                {t.cover}
              </span>
              <span className="font-bengali text-base font-black leading-tight">{t.titleBn}</span>
              <span className="font-bengali text-xs opacity-70">
                {t.titleEn} • {total} পাঠ
              </span>
              <span className="rounded-full border-2 border-ink bg-[#e6f4ec] px-2 text-xs font-extrabold">
                {heard > 0 ? `✅ ${heard}/${total}` : "📖 পড়া শুরু"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
