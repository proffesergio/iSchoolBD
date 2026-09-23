"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminApi,
  API_BASE,
  publicApi,
  type AdminLectureInput,
  type AdminLessonInput,
  type AdminStats,
  type CourseTree,
  type CustomBookRow,
  type StudentRow,
  type VideoCourseTree,
} from "../../lib/admin-client";
import { chartGeometry } from "../../lib/admin-chart";
import { OFFICIAL_BOOKS } from "../../lib/books";
import { isInlinePlayable, parseVideoLink, validateCheckpoints } from "../../lib/video-sources";

type Tab = "stats" | "lessons" | "videos" | "students" | "books";

const KEY_STORAGE = "ischool-admin-key";

const EMPTY_LESSON: AdminLessonInput = {
  id: "", chapterId: "", titleBn: "", titleEn: "", kind: "interactive", xp: 10,
};

const NAV: { id: Tab; glyph: string; label: string; section: string }[] = [
  { id: "stats", glyph: "▦", label: "Overview", section: "Dashboard" },
  { id: "lessons", glyph: "✎", label: "Lessons", section: "Content" },
  { id: "videos", glyph: "▶", label: "Videos", section: "Content" },
  { id: "books", glyph: "📚", label: "Books", section: "Content" },
  { id: "students", glyph: "●", label: "Students", section: "Users" },
];

function Ring({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const safe = Math.min(100, Math.max(0, Math.round(pct)));
  return (
    <div className="pro-ring" role="img" aria-label={`${safe}% ready`}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#e7ebf5" strokeWidth="8" />
        <circle
          cx="38" cy="38" r={r} fill="none" stroke="#34c98e" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (safe / 100) * c}
        />
      </svg>
      <span>{safe}%</span>
    </div>
  );
}

export default function AdminPage() {
  const [key, setKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [tab, setTab] = useState<Tab>("stats");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [apiReachable, setApiReachable] = useState<"checking" | "ok" | "down">("checking");
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const [courses, setCourses] = useState<CourseTree[]>([]);
  const [courseId, setCourseId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [lessonForm, setLessonForm] = useState<AdminLessonInput>(EMPTY_LESSON);

  const [videoCourses, setVideoCourses] = useState<VideoCourseTree[]>([]);
  const [videoCourseId, setVideoCourseId] = useState("");
  const [lectureUrl, setLectureUrl] = useState("");
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureSection, setLectureSection] = useState("auto");

  const [courseForm, setCourseForm] = useState({ id: "", classId: "class-1", subject: "bangla", titleBn: "", titleEn: "" });
  const [chapterForm, setChapterForm] = useState({ id: "", titleBn: "", titleEn: "" });
  const [vcForm, setVcForm] = useState({ id: "", titleBn: "", titleEn: "", classId: "class-1", subject: "math" });
  const [newSection, setNewSection] = useState({ id: "", title: "" });
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, string>>({});
  const [cpOpen, setCpOpen] = useState<string | null>(null);
  const [cpDraft, setCpDraft] = useState("");

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [customBooks, setCustomBooks] = useState<CustomBookRow[]>([]);
  const [bookForm, setBookForm] = useState({ id: "", classId: "class-1", titleBn: "", titleEn: "", driveFileId: "", note: "" });
  const [slotClass, setSlotClass] = useState("all");
  const [slotDrafts, setSlotDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(KEY_STORAGE);
      if (saved) setKey(saved);
    } catch { /* private mode */ }
    publicApi.health().then(() => setApiReachable("ok")).catch(() => setApiReachable("down"));
  }, []);

  const refresh = useCallback(
    async (k: string) => {
      setError(null);
      const [cs, vcs, st, ss, cbs] = await Promise.all([
        publicApi.courses(),
        publicApi.videoCourses(),
        adminApi.students(k),
        adminApi.stats(k),
        publicApi.customBooks().catch((): CustomBookRow[] => []),
      ]);
      const trees = await Promise.all(cs.map((c) => publicApi.courseTree(c.id)));
      const vtrees = await Promise.all(vcs.map((c) => publicApi.videoCourseTree(c.id)));
      setCourses(trees);
      setVideoCourses(vtrees);
      setStudents(st);
      setStats(ss);
      setCustomBooks(cbs);
      if (!courseId && trees[0]) {
        setCourseId(trees[0].id);
        setChapterId(trees[0].chapters[0]?.id ?? "");
        setLessonForm((f) => ({ ...f, chapterId: trees[0].chapters[0]?.id ?? "" }));
      }
      if (!videoCourseId && vtrees[0]) setVideoCourseId(vtrees[0].id);
    },
    [courseId, videoCourseId]
  );

  useEffect(() => {
    if (key) refresh(key).catch((e: Error) => setError(e.message));
  }, [key, refresh]);

  async function unlock(): Promise<void> {
    setError(null);
    try {
      await adminApi.stats(keyInput);
      try {
        window.sessionStorage.setItem(KEY_STORAGE, keyInput);
      } catch { /* no-op */ }
      setKey(keyInput);
      setKeyInput("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (/API 403/.test(msg) && /disabled/.test(msg)) {
        setError("API-তে ADMIN_API_KEY সেট নেই — Vercel API project-এ env যোগ করে Redeploy করো (docs/ADMIN.md §1)।");
      } else if (/API 403/.test(msg)) {
        setError("ভুল কী — API-এর ADMIN_API_KEY-এর সাথে মিলিয়ে আবার দাও।");
      } else if (/Failed to fetch|NetworkError|Load failed/.test(msg) || apiReachable === "down") {
        setError(`API-তে পৌঁছানো যাচ্ছে না (${API_BASE}) — web project-এ NEXT_PUBLIC_API_BASE ঠিক আছে কি? Redeploy করেছো?`);
      } else {
        setError(`লগইন ব্যর্থ: ${msg}`);
      }
    }
  }

  function lock(): void {
    try {
      window.sessionStorage.removeItem(KEY_STORAGE);
    } catch { /* no-op */ }
    setKey(null);
  }

  async function saveLesson(): Promise<void> {
    if (!key) return;
    setError(null);
    setNotice(null);
    try {
      await adminApi.upsertLesson(key, { ...lessonForm, chapterId });
      setNotice(`Lesson saved: ${lessonForm.id}`);
      setLessonForm(EMPTY_LESSON);
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function removeLesson(id: string): Promise<void> {
    if (!key || !window.confirm(`Delete lesson? ${id}`)) return;
    try {
      await adminApi.deleteLesson(key, id);
      setNotice(`Deleted: ${id}`);
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function addLectureFromUrl(): Promise<void> {
    if (!key) return;
    setError(null);
    setNotice(null);
    const ref = parseVideoLink(lectureUrl);
    if (!ref) {
      setError("লিংক চিনতে পারিনি — YouTube / Drive / Terabox / mp4 লিংক দাও।");
      return;
    }
    const id = `${videoCourseId}-l${Date.now().toString(36)}`;
    const input: AdminLectureInput = {
      id,
      title: lectureTitle || ref.sourceId,
      provider: ref.provider,
      sourceUrl: ref.sourceUrl,
      ...(lectureSection === "auto" ? { courseId: videoCourseId } : { sectionId: lectureSection }),
    };
    try {
      await adminApi.upsertLecture(key, input);
      setNotice(`Video added (${ref.provider}): ${input.title}`);
      setLectureUrl("");
      setLectureTitle("");
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Add failed");
    }
  }

  async function removeLecture(id: string): Promise<void> {
    if (!key || !window.confirm(`Delete lecture? ${id}`)) return;
    try {
      await adminApi.deleteLecture(key, id);
      setNotice(`Deleted: ${id}`);
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function saveCourse(): Promise<void> {
    if (!key) return;
    setError(null);
    setNotice(null);
    try {
      await adminApi.upsertCourse(key, courseForm);
      setNotice(`Course saved: ${courseForm.id}`);
      setCourseForm({ id: "", classId: "class-1", subject: "bangla", titleBn: "", titleEn: "" });
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function saveChapter(): Promise<void> {
    if (!key || !courseId) return;
    setError(null);
    setNotice(null);
    try {
      await adminApi.upsertChapter(key, { ...chapterForm, courseId });
      setNotice(`Chapter saved: ${chapterForm.id}`);
      setChapterForm({ id: "", titleBn: "", titleEn: "" });
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function saveVideoCourse(): Promise<void> {
    if (!key) return;
    setError(null);
    setNotice(null);
    try {
      await adminApi.upsertVideoCourse(key, vcForm);
      setNotice(`Video course saved: ${vcForm.id}`);
      setVcForm({ id: "", titleBn: "", titleEn: "", classId: "class-1", subject: "math" });
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function saveSection(id?: string, title?: string): Promise<void> {
    if (!key || !videoCourseId) return;
    setError(null);
    setNotice(null);
    try {
      const payload = id
        ? { id, courseId: videoCourseId, title: title ?? id }
        : { id: newSection.id, courseId: videoCourseId, title: newSection.title };
      await adminApi.upsertSection(key, payload);
      setNotice(`Section saved: ${payload.id}`);
      setNewSection({ id: "", title: "" });
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function removeSection(id: string, lectureCount: number): Promise<void> {    if (!key || !window.confirm(`Delete section + ${lectureCount} lectures? ${id}`)) return;
    try {
      const out = await adminApi.deleteSection(key, id);
      setNotice(`Deleted section ${id} (+${out.lecturesRemoved} lectures)`);
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function saveCustomBook(): Promise<void> {
    if (!key) return;
    setError(null);
    setNotice(null);
    try {
      await adminApi.upsertCustomBook(key, bookForm);
      setNotice(`Book saved: ${bookForm.id}`);
      setBookForm({ id: "", classId: "class-1", titleBn: "", titleEn: "", driveFileId: "", note: "" });
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function removeCustomBook(id: string): Promise<void> {
    if (!key || !window.confirm(`Delete book? ${id}`)) return;
    try {
      await adminApi.deleteCustomBook(key, id);
      setNotice(`Deleted book: ${id}`);
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function extractDriveId(v: string): string {
    const t = v.trim();
    const m = t.match(/\/file\/d\/([-\w]+)/) ?? t.match(/[-\w]{25,}/) ?? t.match(/[-\w]{10,}/);
    return m ? (m[1] ?? m[0]) : t;
  }

  /** Upload-by-name: save a Drive link onto an official slot id. */
  async function saveSlot(id: string): Promise<void> {
    if (!key) return;
    const slot = OFFICIAL_BOOKS.find((x) => x.id === id);
    if (!slot) return;
    const raw = (slotDrafts[id] ?? "").trim();
    if (!raw) {
      setError("আগে Drive লিংক পেস্ট করো।");
      return;
    }
    setError(null);
    setNotice(null);
    try {
      await adminApi.upsertCustomBook(key, {
        id: slot.id,
        classId: slot.classId,
        titleBn: slot.titleBn,
        titleEn: slot.titleEn,
        driveFileId: extractDriveId(raw),
        note: "admin upload",
      });
      setNotice(`Book file saved: ${slot.titleBn}`);
      setSlotDrafts({ ...slotDrafts, [id]: "" });
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  function openCpEditor(lectureId: string, current: AdminLectureInput["checkpoints"]): void {
    setCpOpen(lectureId);
    setCpDraft(JSON.stringify(current ?? [{ atSec: 60, prompt: "", choices: ["", ""], correctChoiceIndex: 0, xp: 5 }], null, 2));
    setError(null);
  }

  async function saveCheckpoints(lecture: AdminLectureInput): Promise<void> {
    if (!key) return;
    setError(null);
    setNotice(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cpDraft);
    } catch {
      setError("JSON ভুল — brackets আর commas দেখো।");
      return;
    }
    const issues = validateCheckpoints(parsed as AdminLectureInput["checkpoints"]);
    if (issues.length > 0) {
      setError(`Checkpoints: ${issues.join("; ")}`);
      return;
    }
    try {
      await adminApi.upsertLecture(key, { ...lecture, checkpoints: parsed as AdminLectureInput["checkpoints"] });
      setNotice(`Check-ins saved for ${lecture.id}`);
      setCpOpen(null);
      await refresh(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  const derived = useMemo(() => {
    const allLessons = courses.flatMap((c) =>
      c.chapters.flatMap((ch) => ch.lessons.map((l) => ({ ...l, courseTitle: c.titleEn, chapterTitle: ch.titleEn })))
    );
    const voiced = allLessons.filter((l) => l.audioUrl).length;
    const chapterCount = courses.reduce((n, c) => n + c.chapters.length, 0);
    const subjects = ["All", ...new Set(videoCourses.map((c) => c.subject ?? "general"))];
    const q = query.trim().toLowerCase();
    const match = (s: string) => !q || s.toLowerCase().includes(q);
    return {
      allLessons, voiced, chapterCount, subjects,
      lessons: allLessons.filter((l) => match(`${l.titleBn} ${l.titleEn} ${l.id}`)),
      students: students.filter((s) => match(s.user_id)),
      courses: videoCourses.filter((c) =>
        (subjectFilter === "All" || (c.subject ?? "general") === subjectFilter) &&
        match(`${c.titleBn} ${c.titleEn} ${c.id}`)
      ),
    };
  }, [courses, videoCourses, students, query, subjectFilter]);

  if (!key) {
    return (
      <main className="pro" style={{ gridTemplateColumns: "1fr" }}>
        <div className="pro-main">
          <div className="pro-login">
            <div className="pro-logo" style={{ color: "#1b2b4b", padding: 0 }}>
              <span className="pro-logo-mark">🎓</span> iSchool Admin
            </div>
            <p style={{ opacity: 0.7 }}>Sign in with your ADMIN_API_KEY (docs/ADMIN.md).</p>
            <p style={{ opacity: 0.7, fontSize: 13 }}>
              API: <code>{API_BASE}</code> —{" "}
              {apiReachable === "checking" ? "checking…" : apiReachable === "ok" ? "✅ reachable" : "❌ unreachable"}
            </p>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              placeholder="Admin key"
              aria-label="Admin key"
            />
            <div className="pro-row">
              <button className="pro-btn go" onClick={unlock}>Unlock</button>
            </div>
            {error && <p className="pro-err">{error}</p>}
          </div>
        </div>
      </main>
    );
  }

  const course = courses.find((c) => c.id === courseId);
  const chapter = course?.chapters.find((c) => c.id === chapterId);
  const vcourse = videoCourses.find((c) => c.id === videoCourseId);
  const xpGoal = 1000;
  const xpPct = stats ? Math.min(100, Math.round((stats.totalXp / xpGoal) * 100)) : 0;
  const chartValues = (stats?.topTopics ?? []).slice(0, 8).map((t) => t.events);
  const chart = chartGeometry(chartValues, 560, 180);
  const voicePct = derived.allLessons.length
    ? Math.round((derived.voiced / derived.allLessons.length) * 100)
    : 0;

  let lastSection = "";
  const sideNav: { kind: "sect" | "item"; id?: Tab; glyph?: string; label?: string; section?: string }[] = [];
  for (const n of NAV) {
    if (n.section !== lastSection) {
      lastSection = n.section;
      sideNav.push({ kind: "sect", section: n.section });
    }
    sideNav.push({ kind: "item", id: n.id, glyph: n.glyph, label: n.label });
  }

  return (
    <div className="pro">
      <aside className="pro-side" aria-label="Admin navigation">
        <div className="pro-logo"><span className="pro-logo-mark">🎓</span> iSchool Admin</div>
        {sideNav.map((n, i) =>
          n.kind === "sect" ? (
            <div key={`s-${i}`} className="pro-sect">{n.section}</div>
          ) : (
            <button
              key={n.id}
              className={tab === n.id ? "pro-nav active" : "pro-nav"}
              onClick={() => setTab(n.id as Tab)}
              aria-current={tab === n.id ? "page" : undefined}
            >
              <span className="glyph" aria-hidden="true">{n.glyph}</span> {n.label}
            </button>
          )
        )}
        <div className="pro-side-foot">
          <button className="pro-lock" onClick={lock}>Lock 🔒</button>
        </div>
      </aside>

      <div className="pro-main">
        <header className="pro-top">
          <label className="pro-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons, videos, students…"
              aria-label="Search admin"
            />
          </label>
          <span className={apiReachable === "ok" ? "pro-dot" : "pro-dot down"}>
            {apiReachable === "ok" ? "● API" : apiReachable === "down" ? "● API down" : "● …"}
          </span>
        </header>

        {error && <p className="pro-err">{error}</p>}
        {notice && <p className="pro-ok">{notice}</p>}

        {tab === "stats" && (
          <>
            <h1 className="pro-hello">👋 Hello, Admin</h1>
            <p className="pro-sub">Nice to have you back — here is your platform today.</p>
            <div className="pro-grid">
              <div className="pro-card">
                <span className="pro-kicker">Total XP</span>
                <p className="pro-big">{stats?.totalXp ?? 0}</p>
                <span style={{ opacity: 0.6, fontSize: 13 }}>points · goal {xpGoal}</span>
                <div className="pro-bar"><div style={{ width: `${xpPct}%` }} /></div>
                <div className="pro-row">
                  <Link className="pro-btn go" style={{ textDecoration: "none" }} href="/">View site</Link>
                  <button className="pro-btn line" onClick={() => key && refresh(key)}>Refresh</button>
                </div>
              </div>
              <div className="pro-card">
                <span className="pro-kicker">Students</span>
                <p className="pro-big">{stats?.students ?? 0}</p>
                <span style={{ opacity: 0.6, fontSize: 13 }}>{stats?.progressEvents ?? 0} learning events</span>
                <div className="pro-row">
                  <button className="pro-btn line" onClick={() => setTab("students")}>Manage →</button>
                </div>
              </div>
              <div className="pro-promo violet">
                <span className="arrow">↗</span>
                <h3>Sprint 2 seeding</h3>
                <p>Push Class-1 content through the API — no code edits.</p>
                <code>node scripts/seed-sprint2-class1.mjs</code>
              </div>
              <div className="pro-promo orange">
                <span className="arrow">↗</span>
                <h3>Voice-overs</h3>
                <p>{voicePct}% of lessons have manual audio ({derived.voiced}/{derived.allLessons.length}).</p>
                <div className="pro-row">
                  <button className="pro-btn go" onClick={() => setTab("lessons")}>Add audio →</button>
                </div>
              </div>
              <div className="pro-card wide">
                <span className="pro-kicker">Activity</span>
                <h3>Top topics by events</h3>
                {chartValues.length > 0 ? (
                  <svg viewBox="0 0 560 180" style={{ width: "100%", height: "auto" }} role="img" aria-label="Activity chart">
                    <defs>
                      <linearGradient id="proArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <path d={chart.area} fill="url(#proArea)" />
                    <path d={chart.line} fill="none" stroke="#7c6cff" strokeWidth="2.5" />
                    {chart.dots.map((d, i) => (
                      <circle key={i} cx={d.x} cy={d.y} r="3.5" fill="#7c6cff" />
                    ))}
                  </svg>
                ) : (
                  <p style={{ opacity: 0.6 }}>No activity yet — students appear here once they learn.</p>
                )}
              </div>
              <div className="pro-card wide">
                <span className="pro-kicker">Catalog</span>
                <h3>{stats?.catalog.lessons ?? 0} lessons · {stats?.catalog.lectures ?? 0} videos</h3>
                <p style={{ opacity: 0.65, fontSize: 14 }}>
                  {courses.length} courses · {derived.chapterCount} chapters · {videoCourses.length} video courses
                </p>
                <div className="pro-row">
                  <button className="pro-btn line" onClick={() => setTab("lessons")}>Edit lessons</button>
                  <button className="pro-btn line" onClick={() => setTab("videos")}>Edit videos</button>
                </div>
              </div>
            </div>

            <h2 style={{ margin: "22px 0 4px" }}>Today&apos;s courses</h2>
            <div className="pro-filters" role="tablist" aria-label="Filter by subject">
              {derived.subjects.map((s) => (
                <button
                  key={s}
                  role="tab"
                  aria-selected={subjectFilter === s}
                  className={subjectFilter === s ? "pro-filter active" : "pro-filter"}
                  onClick={() => setSubjectFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="pro-stack" style={{ marginTop: 12 }}>
              {derived.courses.map((c) => {
                const tree = videoCourses.find((t) => t.id === c.id);
                const lectures = tree?.sections.flatMap((s) => s.lectures) ?? [];
                const ready = lectures.filter((l) => isInlinePlayable(l)).length;
                return (
                  <div key={c.id} className="pro-course">
                    <div className="pro-course-info">
                      <h4>{c.titleBn} <small style={{ opacity: 0.6 }}>· {c.titleEn}</small></h4>
                      <div className="pro-meta">
                        <span>◷ {tree?.sections.length ?? 0} sections</span>
                        <span>▤ {lectures.length} lectures</span>
                        <span>✓ {ready} playable</span>
                      </div>
                      <div className="pro-row">
                        <Link className="pro-btn go" style={{ textDecoration: "none" }} href={`/videos?course=${c.id}`}>Open →</Link>
                        <button className="pro-btn line" onClick={() => { setVideoCourseId(c.id); setTab("videos"); }}>Manage</button>
                      </div>
                    </div>
                    <Ring pct={lectures.length ? (ready / lectures.length) * 100 : 0} />
                  </div>
                );
              })}
              {derived.courses.length === 0 && <p style={{ opacity: 0.6 }}>No courses match.</p>}
            </div>
          </>
        )}

        {tab === "lessons" && (
          <>
            <h1 className="pro-hello">Lessons</h1>
            <p className="pro-sub">Courses, chapters and lessons — changes are live instantly.</p>
            <div className="pro-grid">
              <div className="pro-card wide">
                <h3>New course</h3>
                <div className="pro-form">
                  <input placeholder="id (c4-math)" value={courseForm.id} onChange={(e) => setCourseForm({ ...courseForm, id: e.target.value })} aria-label="Course id" />
                  <select value={courseForm.classId} onChange={(e) => setCourseForm({ ...courseForm, classId: e.target.value })} aria-label="Class">
                    {["preschool", "class-1", "class-2", "class-3", "class-4", "class-5"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="subject" value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} aria-label="Subject" />
                  <input placeholder="শিরোনাম (বাংলা)" value={courseForm.titleBn} onChange={(e) => setCourseForm({ ...courseForm, titleBn: e.target.value })} aria-label="Course Bangla title" />
                  <input placeholder="Title (English)" value={courseForm.titleEn} onChange={(e) => setCourseForm({ ...courseForm, titleEn: e.target.value })} aria-label="Course English title" />
                </div>
                <div className="pro-row"><button className="pro-btn go" onClick={saveCourse}>Save course</button></div>
              </div>
              <div className="pro-card wide">
                <h3>New chapter in {course?.titleEn ?? "…"}</h3>
                <div className="pro-form">
                  <input placeholder="id (c4-ma-shapes)" value={chapterForm.id} onChange={(e) => setChapterForm({ ...chapterForm, id: e.target.value })} aria-label="Chapter id" />
                  <input placeholder="শিরোনাম (বাংলা)" value={chapterForm.titleBn} onChange={(e) => setChapterForm({ ...chapterForm, titleBn: e.target.value })} aria-label="Chapter Bangla title" />
                  <input placeholder="Title (English)" value={chapterForm.titleEn} onChange={(e) => setChapterForm({ ...chapterForm, titleEn: e.target.value })} aria-label="Chapter English title" />
                </div>
                <div className="pro-row"><button className="pro-btn go" onClick={saveChapter}>Save chapter</button></div>
              </div>
              <div className="pro-card full">
                <div className="pro-row" style={{ marginTop: 0 }}>
                  <select value={courseId} onChange={(e) => {
                    setCourseId(e.target.value);
                    const c = courses.find((x) => x.id === e.target.value);
                    setChapterId(c?.chapters[0]?.id ?? "");
                    setLessonForm((f) => ({ ...f, chapterId: c?.chapters[0]?.id ?? "" }));
                  }} aria-label="Course">
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.titleBn}</option>)}
                  </select>
                  <select value={chapterId} onChange={(e) => {
                    setChapterId(e.target.value);
                    setLessonForm((f) => ({ ...f, chapterId: e.target.value }));
                  }} aria-label="Chapter">
                    {course?.chapters.map((c) => <option key={c.id} value={c.id}>{c.titleBn}</option>)}
                  </select>
                </div>
              </div>
              <div className="pro-card full">
                <h3>{lessonForm.id ? "Edit lesson" : "New lesson"}</h3>
                <div className="pro-form">
                  <input placeholder="id (c1-ma-co-9)" value={lessonForm.id} onChange={(e) => setLessonForm({ ...lessonForm, id: e.target.value })} aria-label="Lesson id" />
                  <input placeholder="শিরোনাম (বাংলা)" value={lessonForm.titleBn} onChange={(e) => setLessonForm({ ...lessonForm, titleBn: e.target.value })} aria-label="Title Bangla" />
                  <input placeholder="Title (English)" value={lessonForm.titleEn} onChange={(e) => setLessonForm({ ...lessonForm, titleEn: e.target.value })} aria-label="Title English" />
                  <select value={lessonForm.kind} onChange={(e) => setLessonForm({ ...lessonForm, kind: e.target.value as AdminLessonInput["kind"] })} aria-label="Kind">
                    <option value="interactive">interactive</option>
                    <option value="video">video</option>
                    <option value="quiz">quiz</option>
                  </select>
                  <input placeholder="refId (optional)" value={lessonForm.refId ?? ""} onChange={(e) => setLessonForm({ ...lessonForm, refId: e.target.value || undefined })} aria-label="Ref id" />
                  <input type="number" min={0} max={500} placeholder="XP" value={lessonForm.xp ?? 10} onChange={(e) => setLessonForm({ ...lessonForm, xp: Number(e.target.value) })} aria-label="XP" />
                  <input placeholder="Voice-over audio URL" value={lessonForm.audioUrl ?? ""} onChange={(e) => setLessonForm({ ...lessonForm, audioUrl: e.target.value || undefined })} aria-label="Voice-over audio URL" />
                  <input placeholder="Voice-over text" value={lessonForm.audioText ?? ""} onChange={(e) => setLessonForm({ ...lessonForm, audioText: e.target.value || undefined })} aria-label="Voice-over text" />
                </div>
                <div className="pro-row">
                  <button className="pro-btn go" onClick={saveLesson}>Save lesson</button>
                </div>
              </div>
              <div className="pro-card full">
                <h3>{chapter?.titleBn} — {(chapter?.lessons ?? []).length} lessons</h3>
                <div className="pro-tablewrap">
                  <table className="pro-table">
                    <thead><tr><th>Lesson</th><th>ID</th><th>Kind</th><th>XP</th><th>Audio</th><th></th></tr></thead>
                    <tbody>
                      {(chapter?.lessons ?? [])
                        .filter((l) => !query.trim() || `${l.titleBn} ${l.titleEn} ${l.id}`.toLowerCase().includes(query.trim().toLowerCase()))
                        .map((l) => (
                          <tr key={l.id}>
                            <td><strong>{l.titleBn}</strong><br /><small style={{ opacity: 0.6 }}>{l.titleEn}</small></td>
                            <td><code style={{ fontSize: 12 }}>{l.id}</code></td>
                            <td>{l.kind}</td>
                            <td>+{l.xp}</td>
                            <td>{l.audioUrl ? <>🎙️ <audio src={l.audioUrl} controls preload="none" style={{ width: 140, height: 28, verticalAlign: "middle" }} /></> : "—"}</td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              <button className="pro-btn line" onClick={() => setLessonForm({ ...l })}>Edit</button>{" "}
                              <button className="pro-btn line" onClick={() => removeLesson(l.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "videos" && (
          <>
            <h1 className="pro-hello">Videos</h1>
            <p className="pro-sub">Courses, sections and lectures — paste a link, provider auto-detected.</p>
            <div className="pro-grid">
              <div className="pro-card full">
                <h3>New video course</h3>
                <div className="pro-form">
                  <input placeholder="id (shapes-4)" value={vcForm.id} onChange={(e) => setVcForm({ ...vcForm, id: e.target.value })} aria-label="Video course id" />
                  <input placeholder="শিরোনাম (বাংলা)" value={vcForm.titleBn} onChange={(e) => setVcForm({ ...vcForm, titleBn: e.target.value })} aria-label="Video course Bangla title" />
                  <input placeholder="Title (English)" value={vcForm.titleEn} onChange={(e) => setVcForm({ ...vcForm, titleEn: e.target.value })} aria-label="Video course English title" />
                  <select value={vcForm.classId} onChange={(e) => setVcForm({ ...vcForm, classId: e.target.value })} aria-label="Video course class">
                    {["preschool", "class-1", "class-2", "class-3", "class-4", "class-5"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="subject" value={vcForm.subject} onChange={(e) => setVcForm({ ...vcForm, subject: e.target.value })} aria-label="Video course subject" />
                </div>
                <div className="pro-row"><button className="pro-btn go" onClick={saveVideoCourse}>Save video course</button></div>
              </div>
              <div className="pro-card full">
                <div className="pro-row" style={{ marginTop: 0 }}>
                  <select value={videoCourseId} onChange={(e) => setVideoCourseId(e.target.value)} aria-label="Video course">
                    {videoCourses.map((c) => <option key={c.id} value={c.id}>{c.titleBn}</option>)}
                  </select>
                </div>
                <div className="pro-form" style={{ marginTop: 10 }}>
                  <input placeholder="https://…" value={lectureUrl} onChange={(e) => setLectureUrl(e.target.value)} aria-label="Video URL" />
                  <input placeholder="Lecture title" value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} aria-label="Lecture title" />
                  <select value={lectureSection} onChange={(e) => setLectureSection(e.target.value)} aria-label="Target section">
                    <option value="auto">＋ Auto-new section</option>
                    {(vcourse?.sections ?? []).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="pro-row">
                  <button className="pro-btn go" onClick={addLectureFromUrl}>Add video</button>
                </div>
              </div>
              <div className="pro-card full">
                <h3>Sections in {vcourse?.titleEn ?? "…"}</h3>
                <div className="pro-form">
                  <input placeholder="new section id" value={newSection.id} onChange={(e) => setNewSection({ ...newSection, id: e.target.value })} aria-label="New section id" />
                  <input placeholder="Section title" value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} aria-label="New section title" />
                </div>
                <div className="pro-row"><button className="pro-btn go" onClick={() => saveSection()}>Add section</button></div>
              </div>
              {vcourse?.sections.map((s) => (
                <div key={s.id} className="pro-card full">
                  <div className="pro-row" style={{ marginTop: 0 }}>
                    <input
                      value={sectionDrafts[s.id] ?? s.title}
                      onChange={(e) => setSectionDrafts({ ...sectionDrafts, [s.id]: e.target.value })}
                      aria-label={`Rename ${s.id}`}
                      style={{ flex: 1, minWidth: 180, padding: "10px 12px", fontSize: 15, fontWeight: 800, borderRadius: 10, border: "1.5px solid #d6ddf0", background: "transparent", color: "inherit", fontFamily: "inherit" }}
                    />
                    <span style={{ opacity: 0.6, fontSize: 13, alignSelf: "center" }}>{s.lectures.length} lectures</span>
                    <button className="pro-btn go" onClick={() => saveSection(s.id, sectionDrafts[s.id] ?? s.title)}>Rename</button>
                    <button className="pro-btn line" onClick={() => removeSection(s.id, s.lectures.length)}>Delete section</button>
                  </div>
                  <div className="pro-tablewrap">
                    <table className="pro-table">
                      <thead><tr><th>Lecture</th><th>Provider</th><th>Check-ins</th><th></th></tr></thead>
                      <tbody>
                        {s.lectures
                          .filter((l) => !query.trim() || `${l.title} ${l.provider}`.toLowerCase().includes(query.trim().toLowerCase()))
                          .map((l) => (
                            <tr key={l.id}>
                              <td><strong>{l.title}</strong></td>
                              <td>{l.provider}{!isInlinePlayable(l) && " · external"}</td>
                              <td>{l.checkpoints?.length ?? 0} ✋</td>
                              <td style={{ whiteSpace: "nowrap" }}>
                                <button className="pro-btn line" onClick={() => openCpEditor(l.id, l.checkpoints)}>Check-ins</button>{" "}
                                <button className="pro-btn line" onClick={() => removeLecture(l.id)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {cpOpen && s.lectures.some((l) => l.id === cpOpen) && (
                    <div style={{ marginTop: 10 }}>
                      <h4>✋ Check-ins for {cpOpen} (JSON array)</h4>
                      <textarea
                        value={cpDraft}
                        onChange={(e) => setCpDraft(e.target.value)}
                        rows={8}
                        spellCheck={false}
                        aria-label="Checkpoints JSON"
                        style={{ width: "100%", fontFamily: "monospace", fontSize: 13, borderRadius: 10, padding: 10, boxSizing: "border-box" }}
                      />
                      <div className="pro-row">
                        <button
                          className="pro-btn go"
                          onClick={() => {
                            const lec = s.lectures.find((x) => x.id === cpOpen);
                            if (lec) void saveCheckpoints(lec);
                          }}
                        >
                          Save check-ins
                        </button>
                        <button className="pro-btn line" onClick={() => setCpOpen(null)}>Close</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "students" && (
          <>
            <h1 className="pro-hello">Students ({derived.students.length})</h1>
            <p className="pro-sub">Every login counts — one row per student ID.</p>
            <div className="pro-card full">
              <div className="pro-tablewrap">
                <table className="pro-table">
                  <thead><tr><th>Student</th><th>XP</th><th>Topics</th><th>Streak</th><th>Last active</th></tr></thead>
                  <tbody>
                    {derived.students.map((s) => (
                      <tr key={s.user_id}>
                        <td><strong>{s.user_id}</strong></td>
                        <td>{s.totalXp}</td>
                        <td>{s.topicsCompleted}</td>
                        <td>{s.streakDays} days</td>
                        <td>{s.lastActive?.slice(0, 10) ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {derived.students.length === 0 && <p style={{ opacity: 0.6 }}>No students yet — they appear after first login + learning.</p>}
            </div>
          </>
        )}

        {tab === "books" && (
          <>
            <h1 className="pro-hello">Books ({customBooks.length} uploads)</h1>
            <p className="pro-sub">Every official name is listed below — paste a Drive link per book when its PDF arrives. Guides go in the extra form at the bottom.</p>
            <div className="pro-grid">
              <div className="pro-card full">
                <div className="pro-row" style={{ marginTop: 0 }}>
                  <select value={slotClass} onChange={(e) => setSlotClass(e.target.value)} aria-label="Slot class filter">
                    {["all", "class-1", "class-2", "class-3", "class-4", "class-5"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="pro-tablewrap">
                  <table className="pro-table">
                    <thead><tr><th>Book (official name)</th><th>Class</th><th>Status</th><th>Drive link</th><th></th></tr></thead>
                    <tbody>
                      {OFFICIAL_BOOKS.filter((x) => slotClass === "all" || x.classId === slotClass).map((x) => {
                        const up = customBooks.find((c) => c.id === x.id);
                        const file = up?.driveFileId || x.driveFileId;
                        return (
                          <tr key={x.id}>
                            <td><strong>{x.titleBn}</strong><br /><small style={{ opacity: 0.6 }}>{x.titleEn} · {x.id}</small></td>
                            <td>{x.classId}</td>
                            <td>{file ? "✅ file" : "📥 awaiting"}{up ? " · admin" : ""}</td>
                            <td>
                              <input
                                placeholder="paste Drive link"
                                defaultValue=""
                                key={`${x.id}-${file ? "f" : "e"}`}
                                onBlur={(e) => setSlotDrafts({ ...slotDrafts, [x.id]: e.target.value })}
                                aria-label={`Drive link for ${x.id}`}
                                style={{ width: 200, padding: "8px 10px", fontSize: 13, borderRadius: 8, border: "1.5px solid #d6ddf0" }}
                              />
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              <button className="pro-btn go" onClick={() => saveSlot(x.id)}>Save</button>{" "}
                              {up && <button className="pro-btn line" onClick={() => removeCustomBook(x.id)}>Clear</button>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="pro-card full">
                <h3>New guide / extra book</h3>
                <div className="pro-form">
                  <input placeholder="id (guide-gonit-1)" value={bookForm.id} onChange={(e) => setBookForm({ ...bookForm, id: e.target.value })} aria-label="Book id" />
                  <select value={bookForm.classId} onChange={(e) => setBookForm({ ...bookForm, classId: e.target.value })} aria-label="Book class">
                    {["preschool", "class-1", "class-2", "class-3", "class-4", "class-5"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="শিরোনাম (বাংলা)" value={bookForm.titleBn} onChange={(e) => setBookForm({ ...bookForm, titleBn: e.target.value })} aria-label="Book Bangla title" />
                  <input placeholder="Title (English)" value={bookForm.titleEn} onChange={(e) => setBookForm({ ...bookForm, titleEn: e.target.value })} aria-label="Book English title" />
                  <input placeholder="Drive link or file ID" value={bookForm.driveFileId} onChange={(e) => {
                    const v = e.target.value.trim();
                    const m = v.match(/\/file\/d\/([-\w]+)/) ?? v.match(/[-\w]{25,}/) ?? v.match(/[-\w]{10,}/);
                    setBookForm({ ...bookForm, driveFileId: m ? (m[1] ?? m[0]) : v });
                  }} aria-label="Drive link or file ID" />
                  <input placeholder="Note (optional)" value={bookForm.note} onChange={(e) => setBookForm({ ...bookForm, note: e.target.value })} aria-label="Book note" />
                </div>
                <div className="pro-row"><button className="pro-btn go" onClick={saveCustomBook}>Save book</button></div>
              </div>
              <div className="pro-card full">
                <div className="pro-tablewrap">
                  <table className="pro-table">
                    <thead><tr><th>Book</th><th>Class</th><th>Drive file</th><th></th></tr></thead>
                    <tbody>
                      {customBooks.map((x) => (
                        <tr key={x.id}>
                          <td><strong>{x.titleBn}</strong><br /><small style={{ opacity: 0.6 }}>{x.titleEn} · {x.id}</small></td>
                          <td>{x.classId}</td>
                          <td><code style={{ fontSize: 12 }}>{x.driveFileId.slice(0, 18)}…</code></td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <a className="pro-btn line" style={{ textDecoration: "none" }} href={`https://drive.google.com/file/d/${x.driveFileId}/preview`} target="_blank" rel="noreferrer">Open</a>{" "}
                            <button className="pro-btn line" onClick={() => removeCustomBook(x.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {customBooks.length === 0 && <p style={{ opacity: 0.6 }}>No custom books yet — guides appear in /books instantly after saving.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
