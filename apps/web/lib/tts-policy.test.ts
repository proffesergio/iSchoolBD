import { describe, it, expect } from "vitest";
import { autoSpeakAllowed } from "./tts-policy";

describe("TTS policy", () => {
  it("auto-speaks only for preschool to class 2 (and tier-1)", () => {
    expect(autoSpeakAllowed("preschool")).toBe(true);
    expect(autoSpeakAllowed("class-1")).toBe(true);
    expect(autoSpeakAllowed("class-2")).toBe(true);
    expect(autoSpeakAllowed("tier-1")).toBe(true);
  });

  it("stays silent elsewhere", () => {
    for (const scope of ["class-3", "class-4", "class-5", "tier-2", "tier-3", "general"] as const) {
      expect(autoSpeakAllowed(scope)).toBe(false);
    }
  });
});
