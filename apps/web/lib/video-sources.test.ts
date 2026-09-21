import { describe, it, expect } from "vitest";
import {
  embedUrl,
  isInlinePlayable,
  parseVideoLink,
  structureImport,
  validateCourse,
  type VideoCourse,
} from "./video-sources";

describe("unified video sources", () => {
  it("parses YouTube watch / short / embed links", () => {
    expect(parseVideoLink("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.provider).toBe("youtube");
    expect(parseVideoLink("https://youtu.be/dQw4w9WgXcQ")?.sourceId).toBe("dQw4w9WgXcQ");
    expect(parseVideoLink("https://www.youtube.com/embed/dQw4w9WgXcQ")?.provider).toBe("youtube");
    expect(parseVideoLink("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.provider).toBe("youtube");
  });

  it("parses Google Drive share links", () => {
    const ref = parseVideoLink("https://drive.google.com/file/d/1ABC_def-123/view?usp=sharing");
    expect(ref?.provider).toBe("google-drive");
    expect(ref?.sourceId).toBe("1ABC_def-123");
  });

  it("parses Terabox share links", () => {
    const ref = parseVideoLink("https://1024terabox.com/s/1AbCDeFgHiJk");
    expect(ref?.provider).toBe("terabox");
    expect(ref).not.toBeNull();
  });

  it("parses direct mp4 links and rejects garbage", () => {
    expect(parseVideoLink("https://cdn.example.com/lesson1.mp4")?.provider).toBe("direct");
    expect(parseVideoLink("not a url")).toBeNull();
    expect(parseVideoLink("https://example.com/about")).toBeNull();
  });

  it("builds privacy-enhanced YouTube embeds and Drive previews", () => {
    const yt = parseVideoLink("https://youtu.be/dQw4w9WgXcQ")!;
    expect(embedUrl(yt)).toContain("youtube-nocookie.com");
    const drive = parseVideoLink("https://drive.google.com/file/d/ABC123/view")!;
    expect(embedUrl(drive)).toContain("/preview");
    expect(embedUrl(drive, "file")).toContain("ABC123");
  });

  it("Terabox without a resolved file URL opens externally", () => {
    const tb = parseVideoLink("https://1024terabox.com/s/1AbCDeFgHiJk")!;
    expect(isInlinePlayable(tb)).toBe(false);
    expect(isInlinePlayable({ ...tb, directUrl: "https://cdn.example.com/v.mp4" })).toBe(true);
  });

  it("structures a flat playlist import into sections", () => {
    const yt = parseVideoLink("https://youtu.be/dQw4w9WgXcQ")!;
    const sections = structureImport(
      "math-1",
      Array.from({ length: 7 }, (_, i) => ({ title: `L${i + 1}`, video: yt })),
      6
    );
    expect(sections).toHaveLength(2);
    expect(sections[0].lectures).toHaveLength(6);
    expect(sections[1].lectures).toHaveLength(1);
  });

  it("validates a course", () => {
    const yt = parseVideoLink("https://youtu.be/dQw4w9WgXcQ")!;
    const course: VideoCourse = {
      id: "demo", titleBn: "ডেমো", titleEn: "Demo",
      sections: [{ id: "demo-s1", title: "Section 1", lectures: [{ id: "demo-l1", title: "L1", video: yt }] }],
    };
    expect(validateCourse(course)).toEqual([]);
    expect(validateCourse({ ...course, sections: [] }).length).toBeGreaterThan(0);
  });
});
