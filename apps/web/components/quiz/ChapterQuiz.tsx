"use client";
import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion } from "../../lib/chapter-quiz-bank";

export type QuizMode = "practice" | "exam";

export interface QuizResult {
  mode: QuizMode;
  chapterId: string;
  score: number;
  total: number;
  xp: number;
  avgSecs?: number;
}

interface ChapterQuizProps {
  chapterId: string;
  chapterTitle: string;
  mode: QuizMode;
  questions: QuizQuestion[];
  onDone: (r: QuizResult) => void;
  onExit: () => void;
}

export const EXAM_SECS_PER_Q = 30;
export const PRACTICE_XP = 10;
export const EXAM_PASS_XP = 50;

/** Pure scoring — tested via chapter-progress tests. */
export function scoreQuiz(picks: (number | null)[], questions: QuizQuestion[]): number {
  return questions.filter((x, i) => picks[i] === x.correct).length;
}

export function ChapterQuiz({ chapterId, chapterTitle, mode, questions, onDone, onExit }: ChapterQuizProps) {
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => questions.map(() => null));
  const [hintOpen, setHintOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [left, setLeft] = useState(EXAM_SECS_PER_Q);
  const [startedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState<QuizResult | null>(null);

  const current = questions[idx];
  const isExam = mode === "exam";

  useEffect(() => {
    if (!isExam || finished) return;
    if (left <= 0) {
      advance(true);
      return;
    }
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, isExam, finished, idx]);

  const correctSoFar = useMemo(() => scoreQuiz(picks, questions), [picks, questions]);

  function pick(i: number): void {
    if (locked || finished || picks[idx] !== null) return;
    const next = picks.map((p, k) => (k === idx ? i : p));
    setPicks(next);
    if (isExam) {
      setLocked(true);
      window.setTimeout(() => {
        setLocked(false);
        advance();
      }, 650);
    }
  }

  function advance(timeout = false): void {
    if (timeout && picks[idx] === null) {
      // unanswered on timeout counts as wrong — leave null
    }
    setHintOpen(false);
    if (idx + 1 >= questions.length) {
      finish(picks);
    } else {
      setIdx((v) => v + 1);
      setLeft(EXAM_SECS_PER_Q);
    }
  }

  function finish(finalPicks: (number | null)[]): void {
    const score = scoreQuiz(finalPicks, questions);
    const avgSecs = (Date.now() - startedAt) / 1000 / Math.max(1, questions.length);
    const xp =
      mode === "practice"
        ? score * PRACTICE_XP
        : score === questions.length
          ? EXAM_PASS_XP + 20
          : Math.round((score / questions.length) * EXAM_PASS_XP);
    const result: QuizResult = { mode, chapterId, score, total: questions.length, xp, avgSecs };
    setFinished(result);
    onDone(result);
  }

  if (questions.length === 0) {
    return (
      <div className="sheet">
        <p>এই অধ্যায়ের কুইজ আসছে… ⏳</p>
        <button className="btn ghost" onClick={onExit}>ফিরি</button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((finished.score / finished.total) * 100);
    return (
      <div className="sheet sparkle">
        <div className="big-emoji">{pct === 100 ? "🏆" : pct >= 50 ? "🎉" : "💪"}</div>
        <h2>{pct === 100 ? "পারফেক্ট!" : pct >= 50 ? "শাবাশ!" : "আবার চেষ্টা করো!"}</h2>
        <p>স্কোর: {finished.score}/{finished.total} ({pct}%) · +{finished.xp} XP</p>
        {isExam && typeof finished.avgSecs === "number" && (
          <p style={{ opacity: 0.7 }}>গড় {finished.avgSecs.toFixed(1)}s/প্রশ্ন</p>
        )}
        <button className="btn primary" onClick={onExit}>শেষ ✓</button>
      </div>
    );
  }

  if (!current) return null;
  const answered = picks[idx] !== null;
  const good = answered && picks[idx] === current.correct;

  return (
    <section className="sheet" aria-label={`${chapterTitle} quiz`}>
      <p style={{ opacity: 0.7 }}>
        {isExam ? `⏱️ ${left}s · ` : "📝 প্র্যাকটিস · "}
        প্রশ্ন {idx + 1}/{questions.length} · ✅ {correctSoFar}
      </p>
      {isExam && (
        <div className="xpbar" role="progressbar" aria-valuenow={left} aria-valuemin={0} aria-valuemax={EXAM_SECS_PER_Q}>
          <div style={{ width: `${(left / EXAM_SECS_PER_Q) * 100}%` }} />
        </div>
      )}
      <h2 style={{ marginTop: 8 }}>{current.prompt}</h2>
      <div>
        {current.choices.map((c, i) => {
          const chosen = picks[idx] === i;
          const cls =
            !answered ? "btn ghost opt"
            : i === current.correct ? "btn primary opt"
            : chosen ? "btn ghost opt shake" : "btn ghost opt";
          return (
            <button key={i} type="button" className={cls} onClick={() => pick(i)} disabled={answered && !isExam}>
              {c}
            </button>
          );
        })}
      </div>
      {!isExam && !answered && (
        <button type="button" className="btn ghost" onClick={() => setHintOpen((v) => !v)}>
          💡 হিন্ট
        </button>
      )}
      {hintOpen && !isExam && <p>💡 {current.hint}</p>}
      {answered && !isExam && (
        <p aria-live="polite">{good ? "শাবাশ! 🎉" : `সঠিক: ${current.choices[current.correct]} — আবার হবে! 💪`}</p>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
        <button className="btn ghost" onClick={onExit}>বের হই</button>
        {answered && !isExam && idx + 1 < questions.length && (
          <button className="btn primary" onClick={() => advance()}>পরেরটা →</button>
        )}
        {answered && !isExam && idx + 1 >= questions.length && (
          <button className="btn primary" onClick={() => finish(picks)}>ফলাফল 🏁</button>
        )}
        {isExam && !answered && (
          <button className="btn ghost" onClick={() => advance()}>এড়িয়ে যাই →</button>
        )}
      </div>
    </section>
  );
}
