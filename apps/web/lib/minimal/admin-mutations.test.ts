import { describe, expect, it } from "vitest";
import { addCourseRow, deleteCourseRow, toggleCourseStatus } from "./admin-mutations";
import type { AdminCourseRow } from "./types";

const ROW: AdminCourseRow = {
  id: "demo-1",
  title: "Demo",
  category: "Mathematics",
  students: 10,
  status: "Draft",
  thumbnailLabel: "D",
  thumbnailHue: 220,
};

describe("admin-mutations", () => {
  it("adds a row to the front", () => {
    expect(addCourseRow([], ROW)).toHaveLength(1);
  });
  it("upserts on duplicate id", () => {
    const next = addCourseRow([ROW], { ...ROW, title: "Updated" });
    expect(next).toHaveLength(1);
    expect(next[0].title).toBe("Updated");
  });
  it("deletes by id", () => {
    expect(deleteCourseRow([ROW], "demo-1")).toHaveLength(0);
  });
  it("toggles Draft <-> Published", () => {
    const once = toggleCourseStatus([ROW], "demo-1");
    expect(once[0].status).toBe("Published");
    expect(toggleCourseStatus(once, "demo-1")[0].status).toBe("Draft");
  });
});
