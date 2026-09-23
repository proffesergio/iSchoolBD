import { describe, it, expect } from "vitest";
import { OFFICIAL_BOOKS, bookPreviewUrl, booksForClass, getBook, resolveBooks, validateBooks } from "./books";

describe("book registry", () => {
  it("ships the Primary set: 4 + 4 + 16 + 6 + 6", () => {
    expect(validateBooks()).toEqual([]);
    expect(OFFICIAL_BOOKS).toHaveLength(36);
    expect(booksForClass("class-1")).toHaveLength(4);
    expect(booksForClass("class-2")).toHaveLength(4);
    expect(booksForClass("class-3")).toHaveLength(16);
    expect(booksForClass("class-4")).toHaveLength(6);
    expect(booksForClass("class-5")).toHaveLength(6);
    expect(getBook("nctb-1-bn")?.mapped).toBe(true);
    expect(getBook("nctb-3-bgs-bn")?.mapped).toBe(false);
    expect(getBook("nctb-4-bn")?.driveFileId).toBe("");
  });

  it("builds preview embeds", () => {
    expect(bookPreviewUrl("ABC123DEF456")).toContain("/preview");
  });

  it("merges admin uploads over slots by name", () => {
    const merged = resolveBooks(OFFICIAL_BOOKS, [
      { id: "nctb-4-bn", classId: "class-4", titleBn: "আমার বাংলা বই", titleEn: "X", driveFileId: "1ABCDEFghijKLMNOPqrstu2" },
    ]);
    const slot = merged.find((x) => x.id === "nctb-4-bn")!;
    expect(slot.driveFileId).toBe("1ABCDEFghijKLMNOPqrstu2");
    expect(slot.custom).toBe(true);
    expect(merged.find((x) => x.id === "nctb-1-bn")!.custom).toBe(false);
    expect(merged).toHaveLength(OFFICIAL_BOOKS.length);
  });

  it("flags bad entries", () => {
    expect(
      validateBooks([{ ...OFFICIAL_BOOKS[0], driveFileId: "short" }]).length
    ).toBeGreaterThan(0);
  });
});
