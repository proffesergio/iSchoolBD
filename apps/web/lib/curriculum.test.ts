import { describe, it, expect } from "vitest";
import { CURRICULUM, countLessons, getCourse, validateCurriculum } from "./curriculum";

describe("foundation curriculum (Class 1-3 core)", () => {
  it("covers 3 classes x core subjects (+science in class 3)", () => {
    expect(CURRICULUM).toHaveLength(10);
    for (const classId of ["class-1", "class-2", "class-3"] as const) {
      for (const subject of ["bangla", "math", "english"] as const) {
        expect(getCourse(classId, subject), `${classId}/${subject}`).toBeDefined();
      }
    }
    expect(getCourse("class-3", "science")).toBeDefined();
  });

  it("validates clean: unique ids, titles, xp range", () => {
    expect(validateCurriculum()).toEqual([]);
  });

  it("every course has chapters with lessons", () => {
    expect(countLessons()).toBeGreaterThan(0);
    for (const c of CURRICULUM) {
      expect(c.chapters.length).toBeGreaterThan(0);
      for (const ch of c.chapters) {
        expect(ch.lessons.length).toBeGreaterThan(0);
      }
    }
  });

  it("flags duplicate lesson ids", () => {
    const dup = structuredClone(CURRICULUM);
    dup[1].chapters[0].lessons[0].id = dup[0].chapters[0].lessons[0].id;
    expect(validateCurriculum(dup).some((i) => i.includes("duplicate"))).toBe(true);
  });
});
