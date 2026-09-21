import { describe, it, expect } from "vitest";
import {
  BOOK_PAGES,
  TOTAL_BOOK_ITEMS,
  TRACK_BOOKS,
  getPage,
  praiseText,
  questionPrompt,
  retryText,
} from "./book-pages";
import { getTrack } from "./tracks";

describe("talking-book registry (TDD)", () => {
  it("has unique page ids and a positive button count", () => {
    const ids = BOOK_PAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TOTAL_BOOK_ITEMS).toBeGreaterThan(50);
  });

  it("gives every item a globally unique id with a speakable default name", () => {
    const seen = new Set<string>();
    for (const page of BOOK_PAGES) {
      expect(page.items.length).toBeGreaterThan(0);
      for (const item of page.items) {
        expect(seen.has(item.id)).toBe(false);
        seen.add(item.id);
        // Rhyme rows carry their own language; others follow the page default.
        const want = item.lang ?? page.defaultLang;
        const name = item.name[want];
        expect(name, `${page.id}/${item.id} needs a ${want} name`).toBeTruthy();
      }
    }
  });

  it("keeps the Islamic section behind the parent gate", () => {
    const islamic = getPage("islamic");
    expect(islamic?.gated).toBe(true);
    expect(getPage("sworoborna")?.gated ?? false).toBe(false);
  });

  it("resolves every Tier 2/3 track card to a real track", () => {
    expect(TRACK_BOOKS.length).toBe(5);
    const ids = TRACK_BOOKS.map((t) => t.pageId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TRACK_BOOKS) {
      expect(getTrack(t.trackId)?.lessons.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("speaks prompts, praise and retry in bn/en/ar", () => {
    for (const lang of ["bn", "en", "ar"] as const) {
      expect(questionPrompt(lang, "X").length).toBeGreaterThan(2);
      expect(praiseText(lang).length).toBeGreaterThan(0);
      expect(retryText(lang).length).toBeGreaterThan(0);
    }
  });
});
