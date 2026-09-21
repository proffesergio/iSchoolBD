import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { talkingLetterPayload, tier2QuizPayload, tier3SocraticPayload } from "../src/mockEngine.js";
import { validateResponse } from "../src/validator.js";
import { estimateTokens, truncateToTokenBudget, buildEfficientPrompt } from "../src/tokenOptimizer.js";

describe("mockEngine — Tier 1 talking letter (ক crow example)", () => {
  it("generates valid talking_letter for ক", () => {
    const p = talkingLetterPayload("ক");
    assert.equal(p.module_metadata.tier, "tier_1");
    assert.equal(p.ui_component.type, "talking_letter");
    assert.ok(p.content.interactive_script.includes("ক"));
    assert.equal(validateResponse(p).valid, true);
  });
  it("throws for unknown letter", () => {
    assert.throws(() => talkingLetterPayload("Ω"));
  });
});

describe("mockEngine — Tier 2 & 3", () => {
  it("tier2 quiz is valid + Bangladesh context (Taka/names)", () => {
    const p = tier2QuizPayload();
    assert.equal(validateResponse(p).valid, true);
    assert.ok(p.content.instruction_text.includes("তাজিম") || p.content.challenge.question_body.includes("৳"));
  });
  it("tier3 socratic hint does not reveal answer directly", () => {
    const p = tier3SocraticPayload();
    assert.equal(validateResponse(p).valid, true);
    assert.ok(!p.content.challenge.socratic_hint.includes("উত্তর ৫০"));
  });
});

describe("validator — rejects bad payloads", () => {
  it("rejects missing gamification", () => {
    const p = talkingLetterPayload("অ");
    delete p.gamification;
    assert.equal(validateResponse(p).valid, false);
  });
  it("rejects oversized instruction_text", () => {
    const p = talkingLetterPayload("অ");
    p.content.instruction_text = "x".repeat(501);
    const r = validateResponse(p);
    assert.equal(r.valid, false);
  });
});

describe("tokenOptimizer", () => {
  it("estimates + truncates within budget", () => {
    assert.ok(estimateTokens("অআইঈ") > 0);
    const t = truncateToTokenBudget("অ".repeat(100), 10);
    assert.ok(estimateTokens(t) <= 11);
    assert.ok(buildEfficientPrompt({ tier: "tier_1", topic: "sworoborna", letter: "ক" }).includes("ক"));
  });
});
