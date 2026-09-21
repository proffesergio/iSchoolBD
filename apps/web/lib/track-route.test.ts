import { describe, it, expect } from "vitest";
import { POST } from "../app/api/ai/track/route";

function req(body: unknown): Request {
  return new Request("http://localhost/api/ai/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/ai/track (TDD)", () => {
  it("serves a canonical payload for a known lesson", async () => {
    const res = await POST(req({ trackId: "math-3-addition", lessonId: "m1" }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      moduleMetadata: { tier: string };
      uiComponent: { type: string };
      payloadContent: { challengeBlock: { choices: string[] } };
    };
    expect(json.moduleMetadata.tier).toBe("tier_2");
    expect(json.uiComponent.type).toBe("gamified_quiz");
    expect(json.payloadContent.challengeBlock.choices.length).toBeGreaterThanOrEqual(2);
  });

  it("defaults to the first lesson and serves Tier 3 as socratic_hint", async () => {
    const res = await POST(req({ trackId: "phy-9-motion" }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { uiComponent: { type: string } };
    expect(json.uiComponent.type).toBe("socratic_hint");
  });

  it("404s unknown tracks and 400s bad bodies", async () => {
    expect((await POST(req({ trackId: "nope" }))).status).toBe(404);
    expect((await POST(req({}))).status).toBe(400);
    expect((await POST(req("not-json{"))).status).toBe(400);
  });
});
