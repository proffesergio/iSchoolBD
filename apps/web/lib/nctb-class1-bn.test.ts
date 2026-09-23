import { describe, it, expect } from "vitest";
import { getTrack } from "./tracks";
import { NCTB_CLASS1_BN, NCTB_PATHS, previewUrl, validateNctbMap } from "./nctb-class1-bn";

describe("NCTB Class 1 Bangla map", () => {
  it("is a valid 54-path map", () => {
    expect(validateNctbMap()).toEqual([]);
  });

  it("embeds the real Drive file", () => {
    expect(previewUrl()).toContain(NCTB_CLASS1_BN.driveFileId);
    expect(previewUrl()).toContain("/preview");
  });

  it("verified paths link to real track lessons", () => {
    const track = getTrack("nctb-1-bn-path");
    expect(track).toBeDefined();
    const ids = new Set(track!.lessons.map((l) => l.id));
    for (const x of NCTB_PATHS.filter((q) => q.lesson)) {
      expect(ids.has(x.lesson!), `path #${x.no}`).toBe(true);
    }
  });

  it("keeps v2 claims honest (page + pdf present)", () => {
    const v2 = NCTB_PATHS.filter((x) => x.v === 2);
    expect(v2.length).toBeGreaterThanOrEqual(10);
    for (const x of v2) {
      expect(x.page).toBeDefined();
      expect(x.pdf).toBeDefined();
    }
  });
});
