"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchTalkingLetter } from "../lib/ai-engine";
import type { EnginePayload } from "../lib/types";
import { BOOK_PAGES, TOTAL_BOOK_ITEMS, getPage, pageTitle } from "../lib/book-pages";
import type { BookPageDef } from "../lib/book-pages";
import { TOTAL_TRACK_LESSONS, getTrack } from "../lib/tracks";
import { CURRICULUM } from "../lib/curriculum";
import { classHeadlines, UNIVERSAL_HEADLINES } from "../lib/headlines";
import { RotatingHeadline } from "../components/ui/RotatingHeadline";
import { clearStudentSession, getStudentSession, type StudentProfile } from "../lib/student-auth";
import { supabaseBrowser } from "../lib/supabaseClient";
import { useLearnerStore } from "../lib/store";
import { BookPage } from "../components/features/BookPage";
import { BookShelf } from "../components/features/BookShelf";
import { ParentGate } from "../components/features/ParentGate";
import { TalkingLetterSheet } from "../components/features/TalkingLetter";
import { TrackSheet } from "../components/features/TrackSheet";
import { XpBar } from "../components/ui/XpBar";

export default function Home() {
  const [bookId, setBookId] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [gateFor, setGateFor] = useState<BookPageDef | null>(null);
  const [unlockedGated, setUnlockedGated] = useState<string[]>([]);
  const [bnLetter, setBnLetter] = useState<string | null>(null);
  const [payload, setPayload] = useState<EnginePayload | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);

  const xp = useLearnerStore((s) => s.xp);
  const listenedLetters = useLearnerStore((s) => s.listenedLetters);
  const progressPercentage = useLearnerStore((s) => s.progressPercentage);

  const progress = progressPercentage(TOTAL_BOOK_ITEMS + TOTAL_TRACK_LESSONS);
  const book = bookId ? getPage(bookId) : undefined;
  const track = trackId ? getTrack(trackId) : undefined;

  useEffect(() => {
    useLearnerStore.getState().hydrate();
    setStudent(getStudentSession()?.profile ?? null);
    const sb = supabaseBrowser();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => setUser(data.user?.email ?? data.user?.phone ?? null));
  }, []);

  // Backend payload for the rich শোনো→শব্দ→খেলা sheet (Bangla letter books).
  useEffect(() => {
    if (!bnLetter) return;
    setPayload(null);
    let cancelled = false;
    fetchTalkingLetter(bnLetter).then((p) => {
      if (!cancelled) setPayload(p);
    });
    return () => {
      cancelled = true;
    };
  }, [bnLetter]);

  function openBook(page: BookPageDef): void {
    if (page.gated === true && !unlockedGated.includes(page.id)) {
      setGateFor(page);
      return;
    }
    setBookId(page.id);
  }

  function passGate(): void {
    if (!gateFor) return;
    setUnlockedGated((u) => (u.includes(gateFor.id) ? u : [...u, gateFor.id]));
    setBookId(gateFor.id);
    setGateFor(null);
  }

  async function login() {
    window.location.href = "/login";
  }

  function logout() {
    clearStudentSession();
    setStudent(null);
  }

  const myCourses = student ? CURRICULUM.filter((c) => c.classId === student.classId) : [];
  const little = student && (student.classId === "preschool" || student.classId === "class-1" || student.classId === "class-2");
  const heroLines = student
    ? [...classHeadlines(student.name, !!little), ...UNIVERSAL_HEADLINES]
    : UNIVERSAL_HEADLINES;

  return (
    <main>
      <div className="topbar">
        <span className="pill">⭐ XP: {xp}</span>
        <span className="pill">🌱 {progress}%</span>
        {student ? (
          <Link className="pill" href="/dashboard" aria-label="dashboard">{student.avatar} {student.name}</Link>
        ) : (
          <button className="pill" onClick={login} aria-label="login">{user ? `👧 ${user}` : "🔑 লগইন"}</button>
        )}
      </div>
      <div className="hero">
        {student && (
          <p className="hero-eyebrow">
            {student.avatar} {student.name} • {myCourses[0]?.titleBn.split(" ")[0] ?? "শিক্ষার্থী"} {little ? "🌱" : "🚀"}
          </p>
        )}
        <h1>
          <RotatingHeadline lines={heroLines} />
        </h1>
        {student ? (
          <>
            <p className="hero-sub">{little ? "খেলতে খেলতে শিখি! 👆🔊" : "চলো আজকের পড়া শেষ করি! 💪"}</p>
            <div className="hero-cta">
              <Link className="btn primary" href="/dashboard">🏆 ড্যাশবোর্ড</Link>
              <button className="btn ghost" onClick={logout}>বের হই</button>
            </div>
          </>
        ) : (
          <>
            <p className="hero-sub">এক প্ল্যাটফর্ম — শৈশব থেকে স্বপ্নের দিকে। 👆🔊</p>
            <div className="hero-cta">
              <Link className="btn primary" href="/login">🔑 Student লগইন — নিজের পড়া দেখো!</Link>
            </div>
          </>
        )}
        <div className="hero-meter">
          <XpBar progress={progress} />
          <p className="font-bengali text-sm opacity-70">
            {listenedLetters.length}/{TOTAL_BOOK_ITEMS + TOTAL_TRACK_LESSONS} শেখা হয়েছে
          </p>
        </div>
      </div>

      {student && myCourses.length > 0 && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "14px" }}>
          <h2 className="section-title">🎒 আমার শ্রেণির পড়া</h2>
          <div className="grid" style={{ padding: 0 }}>
            {myCourses.map((c) => (
              <Link key={`${c.classId}-${c.subject}`} href={`/courses/${c.classId}/${c.subject}`} className="card" style={{ textDecoration: "none", color: "inherit", fontSize: 22 }}>
                {c.subject === "bangla" ? "📝" : c.subject === "math" ? "🔢" : "🔤"}
                <small>{c.titleBn}</small>
                <small style={{ fontSize: 13, opacity: 0.7 }}>{c.chapters.length} অধ্যায়</small>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "14px" }}>
        <BookShelf
          pages={BOOK_PAGES}
          unlockedGated={unlockedGated}
          onOpen={openBook}
          onOpenTrack={setTrackId}
        />
      </div>

      {gateFor && (
        <div className="fullscreen" onClick={() => setGateFor(null)} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(480px, 100%)" }}>
            <ParentGate
              pageTitle={pageTitle(gateFor, "bn")}
              onPass={passGate}
              onClose={() => setGateFor(null)}
            />
          </div>
        </div>
      )}

      {book && (
        <div className="fullscreen" onClick={() => setBookId(null)} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(640px, 100%)" }}>
            <BookPage
              page={book}
              onOpenLetter={book.sheet === "talking-letter" ? setBnLetter : undefined}
              onClose={() => setBookId(null)}
            />
          </div>
        </div>
      )}

      {track && (
        <div className="fullscreen" onClick={() => setTrackId(null)} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(640px, 100%)" }}>
            <TrackSheet track={track} onClose={() => setTrackId(null)} />
          </div>
        </div>
      )}

      {bnLetter && (
        <div className="fullscreen" onClick={() => setBnLetter(null)} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(560px, 100%)" }}>
            <TalkingLetterSheet
              letter={bnLetter}
              payload={payload}
              totalLetters={TOTAL_BOOK_ITEMS + TOTAL_TRACK_LESSONS}
              onClose={() => setBnLetter(null)}
            />
          </div>
        </div>
      )}
      <div className="footer">Free Forever Learning 🌟 • NCTB-aligned • Made with 💚 in Bangladesh</div>
    </main>
  );
}
