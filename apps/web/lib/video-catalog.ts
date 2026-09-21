import { parseVideoLink, structureImport, type VideoCourse } from "./video-sources";

/**
 * Seed video catalog. Teachers append courses here (or via the Sprint 4
 * playlist-importer API); the player and search read only this registry.
 * Replace demo URLs with real lesson links before launch.
 */
function course(
  id: string, titleBn: string, titleEn: string, classId: string, subject: string,
  lectures: { title: string; url: string; durationSec?: number }[]
): VideoCourse {
  const items = lectures.map((l) => {
    const video = parseVideoLink(l.url);
    if (!video) throw new Error(`Bad seed URL: ${l.url}`);
    return { title: l.title, video, durationSec: l.durationSec };
  });
  return { id, titleBn, titleEn, classId, subject, sections: structureImport(id, items) };
}

export const VIDEO_CATALOG: VideoCourse[] = [
  course("gonit-1-intro", "গণনা শেখো", "Learn Counting", "class-1", "math", [
    { title: "১–১০ গণনা", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", durationSec: 240 },
    { title: "১১–২০ গণনা", url: "https://drive.google.com/file/d/1DEMOfileIDabc/view?usp=sharing", durationSec: 300 },
  ]),
];

export function getVideoCourse(id: string): VideoCourse | undefined {
  return VIDEO_CATALOG.find((c) => c.id === id);
}
