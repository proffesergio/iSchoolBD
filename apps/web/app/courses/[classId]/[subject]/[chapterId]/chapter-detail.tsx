"use client";
import Link from "next/link";
import { useState } from "react";
import { ChapterQuiz, type QuizMode, type QuizResult } from "@/components/quiz/ChapterQuiz";
import { Confetti } from "@/components/feedback/Confetti";
import { XpToasts, type XpToast } from "@/components/feedback/XpToast";
import { questionsFor } from "@/lib/chapter-quiz-bank";
import {
  currentUserId,
  loadProgress,
  persistProgress,
  recordChapter,
  syncChapter,
} from "@/lib/chapter-progress";
import { playSuccess } from "@/lib/melody";
import { useLearnerStore } from "@/lib/store";
import type { Chapter } from "@/lib/curriculum";

const KIND_EMOJI = { interactive: "🎮", video: "🎬", quiz: "❓" } as const;

export function ChapterDetail({
  classId,
  subject,
  chapter,
}: {
  classId: string;
  subject: string;
  chapter: Chapter;
}) {
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [toasts, setToasts] = useState<XpToast[]>([]);
  const [confettiKey, setConfettiKey] = useState(0);
  const questions = questionsFor(chapter.id);

  function pushToast(text: string): void {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }

  function handleDone(r: QuizResult): void {
    const next = recordChapter(loadProgress(), r.chapterId, r.score, r.total, r.xp);
    persistProgress(next);
    useLearnerStore.getState().addXp(r.xp, 1);
    void syncChapter(currentUserId(), r.chapterId, r.score, r.total, r.xp);
    pushToast(`+${r.xp} XP 🎉`);
    if (r.score === r.total) {
      setConfettiKey((k) => k + 1);
      playSuccess();
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <Confetti burstKey={confettiKey} />
      <XpToasts items={toasts} />
      <p><Link href={`/courses/${classId}/${subject}`}>← অধ্যায়</Link></p>
      <h1>📖 {chapter.titleBn}</h1>
      <p style={{ opacity: 0.75 }}>{chapter.titleEn}</p>

      <h2>পাঠ ({chapter.lessons.length})</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {chapter.lessons.map((l, i) => (
          <div key={l.id} className="card" style={{ fontSize: 17, textAlign: "left", display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", animation: "none" }}>
            <span aria-hidden="true">{KIND_EMOJI[l.kind]}</span>
            <span style={{ flex: 1 }}>
              <strong>{i + 1}. {l.titleBn}</strong>
              <small style={{ display: "block", fontSize: 13, opacity: 0.7 }}>{l.titleEn} · +{l.xp} XP</small>
            </span>
          </div>
        ))}
      </div>

      <h2>🎯 কুইজ ({questions.length} প্রশ্ন)</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn primary" onClick={() => setMode("practice")}>📝 প্র্যাকটিস (হিন্টসহ)</button>
        <button className="btn ghost" onClick={() => setMode("exam")}>⏱️ পরীক্ষা মোড (৩০s/প্রশ্ন)</button>
      </div>
      <p style={{ opacity: 0.7 }}>প্র্যাকটিস: প্রতি সঠিকে +10 XP · পরীক্ষা: স্কোরে +50 XP পর্যন্ত 🏆</p>

      {mode && (
        <div className="fullscreen" role="dialog" aria-modal="true">
          <div style={{ width: "min(560px, 100%)" }} onClick={(e) => e.stopPropagation()}>
            <ChapterQuiz
              chapterId={chapter.id}
              chapterTitle={chapter.titleBn}
              mode={mode}
              questions={questions}
              onDone={handleDone}
              onExit={() => setMode(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
