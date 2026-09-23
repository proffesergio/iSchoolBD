/**
 * Minimal course-browser types (Views A/B/C).
 * Deliberately flat and JSON-safe so admin mutations stay pure.
 */

export type CourseStatus = "Draft" | "Published";

export interface MinimalLecture {
  id: string;
  title: string;
  kind: "video" | "document";
  duration: string;
  durationSec?: number;
}

export interface MinimalModule {
  id: string;
  title: string;
  lectures: MinimalLecture[];
}

export interface MinimalCourse {
  id: string;
  category: string;
  level: string;
  title: string;
  instructor: string;
  rating: number;
  ratingsCount: number;
  price: string;
  enrollment: string;
  students: number;
  status: CourseStatus;
  thumbnailLabel: string;
  thumbnailHue: number;
  overview: string;
  resources: string[];
  modules: MinimalModule[];
}

export interface AdminCourseRow {
  id: string;
  title: string;
  category: string;
  students: number;
  status: CourseStatus;
  thumbnailLabel: string;
  thumbnailHue: number;
}

export function toAdminRow(c: MinimalCourse): AdminCourseRow {
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    students: c.students,
    status: c.status,
    thumbnailLabel: c.thumbnailLabel,
    thumbnailHue: c.thumbnailHue,
  };
}
