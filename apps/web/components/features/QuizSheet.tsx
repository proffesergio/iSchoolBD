"use client";
import { useEffect, useState } from "react";
import type { TrackDef, TrackLesson } from "../../lib/tracks";
import { speakBangla, useLearnerStore } from "../../lib/store";

interface QuizSheetProps {
  track: TrackDef;
  startAt?: number;
  onExit: () => void;
}

/**
 * Generic Tier 2/3 lesson sheet: instruction → Socratic hints (💡, stepped,
 * never revealing) → MCQ → XP. One component serves math, physics,
 * chemistry, ICT and AI tracks (one-track-per-tier rule).
 *
 * TTS policy: NO autoplay here (class 3+). Speech is tap-to-hear only —
 * every block has its own 🔊 button, plus admin voice-overs where attached.
 */
export function QuizSheet({ track, startAt, onExit }: QuizSheetProps) {
  const [idx, setIdx] = useState(startAt ?? 0);
  const [revealed, setRevealed] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"idle" | "good" | "bad">("idle");

  const xp = useLearnerStore((s) => s.xp);
  const seenTopics = useLearnerStore((s) => s.seenTopics);

  const lesson: TrackLesson | undefined = track.lessons[idx];
  const doneCount = track.lessons.filter((l) =>
    seenTopics.includes(`lesson:${track.id}:${l.id}`)
  ).length;

  useEffect(() => {
    setRevealed(0);
    setSelected(null);
    setResult("idle");
    // No autoplay TTS on class 3+ (see lib/tts-policy.ts) — 🔊 buttons below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, track.id]);

  if (!lesson) return null;

  function revealHint(): void {
    if (revealed >= lesson!.hints.length) return;
    setRevealed((r) => r + 1);
  }

  function answer(i: number): void {
    if (!lesson) return;
    setSelected(i);
    const store = useLearnerStore.getState();
    if (i === lesson.correctChoiceIndex) {
      store.addXp(track.baseXp, track.streak);
      store.markSeen(`lesson:${track.id}:${lesson.id}`);
      store.recordListen(`lesson:${track.id}:${lesson.id}`);
      setResult("good");
    } else {
      setResult("bad");
    }
    window.setTimeout(() => {
      // Keep success visible (with the next-lesson button); clear failure nudges.
      setResult((r) => (r === "good" ? r : "idle"));
    }, 900);
  }

  const isLast = idx >= track.lessons.length - 1;

  return (
    <section
      className={`mx-auto w-full max-w-xl rounded-3xl border-4 border-ink bg-cream p-5 text-center shadow-[8px_8px_0_#16324f] ${result === "bad" ? "shake" : result === "good" ? "sparkle" : ""}`}
      aria-label={`${track.titleBn} lesson ${idx + 1}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2 text-sm font-extrabold">
        <span className="rounded-full border-[3px] border-ink bg-white px-3 py-1">
          {track.cover} {track.titleBn}
        </span>
        <span className="rounded-full border-[3px] border-ink bg-white px-3 py-1">
          ⭐ {xp} • ✅ {doneCount}/{track.lessons.length}
        </span>
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit track"
          className="rounded-full border-[3px] border-ink bg-white px-3 py-1 shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
        >
          ✕
        </button>
      </div>

      {/* Lesson dots */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1" role="tablist" aria-label="Lessons">
        {track.lessons.map((l, i) => {
          const done = seenTopics.includes(`lesson:${track.id}:${l.id}`);
          return (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              onClick={() => setIdx(i)}
              className={`min-h-[36px] min-w-[36px] rounded-full border-2 border-ink px-2 font-black ${
                i === idx ? "bg-accent3" : done ? "bg-accent2 text-white" : "bg-white"
              }`}
            >
              {done ? "✅" : i + 1}
            </button>
          );
        })}
      </div>

      <p className="mt-3 font-bengali text-base opacity-80">{track.coachLine}</p>
      <h2 className="mt-1 font-bengali text-xl font-black">{lesson.instruction}</h2>
      <button
        type="button"
        onClick={() => speakBangla(lesson.instruction)}
        aria-label="Listen to instruction"
        className="mt-1 min-h-[44px] rounded-full border-[3px] border-ink bg-white px-4 py-1 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
      >
        🔊 শোনো
      </button>
      <h3 className="mt-2 font-bengali text-2xl font-black">{lesson.prompt}</h3>

      <div className="mt-3">
        {lesson.choices.map((c, i) => (
          <button
            key={`${c}-${i}`}
            type="button"
            onClick={() => answer(i)}
            className={`mt-2 block min-h-[52px] w-full rounded-full border-[3px] border-ink px-4 py-2 font-bold shadow-[3px_3px_0_#16324f] ${
              selected === i
                ? i === lesson.correctChoiceIndex
                  ? "bg-accent2 text-white"
                  : "bg-red-300"
                : "bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Socratic hints — stepped, never revealing (validated in tracks.test.ts) */}
      <div className="mt-3 rounded-2xl border-2 border-dashed border-ink bg-white p-3 text-left">
        <button
          type="button"
          onClick={revealHint}
          disabled={revealed >= lesson.hints.length}
          className="min-h-[48px] rounded-full border-[3px] border-ink bg-accent3 px-5 py-1 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5 disabled:opacity-50"
        >
          💡 হিন্ট ({revealed}/{lesson.hints.length})
        </button>
        {lesson.hints.slice(0, revealed).map((h, i) => (
          <p key={i} className="mt-2 font-bengali text-sm">
            💡 {h}
          </p>
        ))}
      </div>

      <p className="mt-2 min-h-6 text-center font-bengali text-sm" aria-live="polite">
        {result === "good"
          ? `${lesson.onSuccess} (+${track.baseXp} XP)`
          : result === "bad"
            ? lesson.onFailure
            : " "}
      </p>

      {result === "good" && !isLast && (
        <button
          type="button"
          onClick={() => setIdx((i) => i + 1)}
          className="mt-1 min-h-[56px] rounded-full border-[3px] border-ink bg-accent2 px-6 py-2 text-lg font-black text-white shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
        >
          পরের পাঠ →
        </button>
      )}
      {result === "good" && isLast && (
        <p className="mt-1 font-bengali font-black">🎉 ট্র্যাক শেষ! তুমি চ্যাম্পিয়ন!</p>
      )}
    </section>
  );
}
