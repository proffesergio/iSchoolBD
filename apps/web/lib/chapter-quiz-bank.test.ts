import { describe, it, expect } from "vitest";
import { CURRICULUM } from "./curriculum";
import { QUIZ_BANK, questionsFor, validateBank } from "./chapter-quiz-bank";

describe("chapter quiz bank", () => {
  it("is internally valid", () => {
    expect(validateBank()).toEqual([]);
  });

  it("covers every chapter with 4 questions", () => {
    const chapters = CURRICULUM.flatMap((c) => c.chapters.map((ch) => ch.id));
    expect(chapters.length).toBeGreaterThanOrEqual(20);
    for (const id of chapters) {
      expect(questionsFor(id), id).toHaveLength(4);
    }
    expect(QUIZ_BANK).toHaveLength(chapters.length * 4);
  });

  it("flags bad entries", () => {
    const issues = validateBank([
      { id: "x", chapterId: "c", prompt: "", choices: ["one"], correct: 5, hint: "" },
    ]);
    expect(issues.length).toBeGreaterThanOrEqual(3);
  });
});
