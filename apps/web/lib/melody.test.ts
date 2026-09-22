import { describe, it, expect } from "vitest";
import { playSuccess } from "./melody";

describe("melody", () => {
  it("stays silent without a window", () => {
    expect(playSuccess()).toBe(false);
  });
});
