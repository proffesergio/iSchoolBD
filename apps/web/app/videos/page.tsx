import { CoursePlayer } from "../../components/video/CoursePlayer";
import { getVideoCourse, VIDEO_CATALOG } from "../../lib/video-catalog";

export const metadata = { title: "Videos — iSchool" };

export default function VideosPage({ searchParams }: { searchParams?: { course?: string } }) {
  const course = (searchParams?.course ? getVideoCourse(searchParams.course) : VIDEO_CATALOG[0]) ?? VIDEO_CATALOG[0];
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 14px 110px" }}>
      <h1>🎬 {course.titleBn}</h1>
      <p style={{ opacity: 0.75 }}>{course.titleEn}</p>
      <CoursePlayer course={course} />
      {VIDEO_CATALOG.length > 1 && (
        <>
          <h2>আরও কোর্স</h2>
          <ul>
            {VIDEO_CATALOG.filter((c) => c.id !== course.id).map((c) => (
              <li key={c.id}>
                <a href={`/videos?course=${c.id}`}>{c.titleBn}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
