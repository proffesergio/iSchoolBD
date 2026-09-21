"use client";
import { useEffect, useRef, useState } from "react";
import type { EnginePayload } from "../../lib/types";
import { TraceCanvas } from "./TraceCanvas";
import {
  LISTENS_TO_UNLOCK,
  spellLetterSound,
  speakBangla,
  useLearnerStore,
} from "../../lib/store";
import { XpBar } from "../ui/XpBar";

type LearnStep = "listen" | "word" | "test";

interface TalkingLetterSheetProps {
  letter: string;
  payload: EnginePayload | null;
  totalLetters: number;
  onClose: () => void;
}

const STEPS: { id: LearnStep; label: string }[] = [
  { id: "listen", label: "শোনো" },
  { id: "word", label: "শব্দ" },
  { id: "test", label: "খেলা" },
];

/**
 * Tier 1 (Ages 2–5): learn-first sheet.
 * Step 1 "শোনো" spells ONLY the letter (slow TTS). The word card ("শব্দ")
 * and the quiz ("খেলা") unlock gradually after LISTENS_TO_UNLOCK listens,
 * so toddlers master the sound before facing any test.
 * Purely visual, high-patience, mobile-webview safe (no server imports).
 */
export function TalkingLetterSheet({
  letter,
  payload,
  totalLetters,
  onClose,
}: TalkingLetterSheetProps) {
  const [step, setStep] = useState<LearnStep>("listen");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [tracing, setTracing] = useState(false);
  const tracedOnce = useRef<Set<string>>(new Set());

  const xp = useLearnerStore((s) => s.xp);
  const addXp = useLearnerStore((s) => s.addXp);
  const markSeen = useLearnerStore((s) => s.markSeen);
  const recordListen = useLearnerStore((s) => s.recordListen);
  const listenCount = useLearnerStore((s) => s.listenCounts[letter] ?? 0);
  const progressPercentage = useLearnerStore((s) => s.progressPercentage);
  const feedback = useLearnerStore((s) => s.lastFeedback);
  const setFeedback = useLearnerStore((s) => s.setFeedback);

  const progress = progressPercentage(totalLetters);
  const unlocked = listenCount >= LISTENS_TO_UNLOCK;
  const remaining = Math.max(0, LISTENS_TO_UNLOCK - listenCount);
  const challenge = payload?.content.challenge;

  // Opening a letter always restarts at "শোনো" and spells just the letter.
  useEffect(() => {
    setStep("listen");
    setSelectedChoice(null);
    setTracing(false);
    setFeedback("idle");
    const t = window.setTimeout(() => {
      spellLetterSound(letter);
      recordListen(letter);
    }, 350);
    return () => {
      window.clearTimeout(t);
      try {
        window.speechSynthesis?.cancel();
      } catch {
        // no-op
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter]);

  function handleReplay(): void {
    spellLetterSound(letter);
    recordListen(letter);
  }

  function handleTraceDone(): void {
    if (!tracedOnce.current.has(letter)) {
      tracedOnce.current.add(letter);
      addXp(5, 1);
      speakBangla("দারুণ লিখেছো! 🎉");
    }
  }

  function handleWord(): void {
    setStep("word");
    if (payload?.content.interactive_script) {
      speakBangla(payload.content.interactive_script);
    }
  }

  function handleAnswer(idx: number): void {
    if (!challenge || !payload) return;
    setSelectedChoice(idx);
    const ok = idx === challenge.correct_answer_index;
    if (ok) {
      addXp(payload.gamification.xp_reward, payload.gamification.streak_multiplier);
      markSeen(payload.module_metadata.topic);
      setFeedback("success_sparkle");
      speakBangla(payload.gamification.feedback_message.on_success);
    } else {
      setFeedback("shake_error");
      speakBangla(payload.gamification.feedback_message.on_failure);
    }
    window.setTimeout(() => setFeedback("idle"), 900);
  }

  return (
    <section
      className={`mx-auto w-full max-w-xl rounded-3xl border-4 border-ink bg-cream p-5 text-center shadow-[8px_8px_0_#16324f] ${feedback === "shake_error" ? "shake" : feedback === "success_sparkle" ? "sparkle" : ""}`}
      aria-label={`Learn letter ${letter}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-sm font-extrabold">
        <span className="rounded-full border-[3px] border-ink bg-white px-3 py-1">
          ⭐ XP: {xp}
        </span>
        <span className="rounded-full border-[3px] border-ink bg-white px-3 py-1">
          🌱 {progress}%
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-full border-[3px] border-ink bg-white px-3 py-1 shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
        >
          ✕
        </button>
      </div>
      <XpBar progress={progress} />

      {/* Step indicator: শোনো → শব্দ → খেলা */}
      <ol className="mt-3 flex items-center justify-center gap-2 font-bengali text-sm font-extrabold" aria-label="Learning steps">
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const locked = s.id !== "listen" && !unlocked;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={`rounded-full border-2 border-ink px-3 py-1 ${
                  active ? "bg-accent3" : locked ? "bg-gray-200 opacity-60" : "bg-white"
                }`}
              >
                {locked ? "🔒" : `${i + 1}. ${s.label}`}
              </span>
              {i < STEPS.length - 1 && <span aria-hidden="true">→</span>}
            </li>
          );
        })}
      </ol>

      <div
        className="my-3 animate-bounce text-[110px] leading-none"
        role="img"
        aria-label={`Letter ${letter}`}
      >
        {letter}
      </div>

      {step === "listen" && (
        <div>
          <h2 className="font-bengali text-xl font-black">{letter} বলো! 🗣️</h2>
          <p className="mt-1 font-bengali text-base opacity-80" aria-live="polite">
            শোনা {listenCount} বার {remaining > 0 ? `(আর ${remaining} বার শুনলে খেলা খুলবে 🔒)` : "(খেলা খুলে গেছে! 🎉)"}
          </p>
          <button
            type="button"
            onClick={handleReplay}
            className="mt-3 min-h-[56px] rounded-full border-[3px] border-ink bg-white px-6 py-2 text-lg font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
          >
            🔊 আবার শোনো
          </button>
          {!tracing ? (
            <button
              type="button"
              onClick={() => setTracing(true)}
              className="mt-2 block min-h-[56px] w-full rounded-full border-[3px] border-ink bg-white px-6 py-2 text-lg font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
            >
              ✏️ হাতে লিখি
            </button>
          ) : (
            <div className="mt-2">
              <TraceCanvas letter={letter} onComplete={handleTraceDone} />
              <button
                type="button"
                onClick={() => setTracing(false)}
                className="mt-2 min-h-[48px] rounded-full border-[3px] border-ink bg-white px-5 py-2 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
              >
                ← শোনোতে ফিরি
              </button>
            </div>
          )}
          {unlocked && (
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleWord}
                className="min-h-[56px] rounded-full border-[3px] border-ink bg-accent2 px-6 py-2 text-lg font-black text-white shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
              >
                শব্দ শিখি 🐦
              </button>
              <button
                type="button"
                onClick={() => setStep("test")}
                className="min-h-[56px] rounded-full border-[3px] border-ink bg-accent3 px-6 py-2 text-lg font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
              >
                খেলি! 🎮
              </button>
            </div>
          )}
        </div>
      )}

      {step === "word" && (
        <div>
          {!payload ? (
            <p>লোড হচ্ছে… ⏳</p>
          ) : (
            <>
              <div className="text-7xl" role="img" aria-label="Word picture">
                {payload.content.instruction_text.split(" ").slice(-1)}
              </div>
              <h2 className="mt-2 font-bengali text-xl font-black">
                {payload.content.instruction_text}
              </h2>
              <p className="mt-1 font-bengali text-base opacity-80">
                🗣️ {payload.content.interactive_script}
              </p>
            </>
          )}
          <div className="mt-3 flex flex-col gap-2">
            {unlocked ? (
              <button
                type="button"
                onClick={() => setStep("test")}
                className="min-h-[56px] rounded-full border-[3px] border-ink bg-accent3 px-6 py-2 text-lg font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
              >
                খেলি! 🎮
              </button>
            ) : (
              <p className="font-bengali text-sm opacity-80">
                আর {remaining} বার শুনলে খেলা খুলবে 🔒
              </p>
            )}
            <button
              type="button"
              onClick={() => setStep("listen")}
              className="min-h-[48px] rounded-full border-[3px] border-ink bg-white px-5 py-2 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
            >
              ← শোনোতে ফিরি
            </button>
          </div>
        </div>
      )}

      {step === "test" && (
        <div>
          {!payload || !challenge ? (
            <p>লোড হচ্ছে… ⏳</p>
          ) : (
            <>
              <h3 className="font-bengali font-extrabold">{challenge.question_body}</h3>
              {challenge.options.map((o, i) => (
                <button
                  key={`${o}-${i}`}
                  type="button"
                  onClick={() => handleAnswer(i)}
                  className={`mt-2 block min-h-[52px] w-full rounded-full border-[3px] border-ink px-4 py-2 font-bold shadow-[3px_3px_0_#16324f] ${
                    selectedChoice === i
                      ? i === challenge.correct_answer_index
                        ? "bg-accent2 text-white"
                        : "bg-red-300"
                      : "bg-accent3"
                  }`}
                >
                  {(["🅰️", "🅱️", "🇨", "🇩"] as const)[i] ?? "👉"} {o}
                </button>
              ))}
              <p className="mt-2 min-h-6 text-center font-bengali text-sm" aria-live="polite">
                {feedback === "success_sparkle"
                  ? payload.gamification.feedback_message.on_success
                  : feedback === "shake_error"
                    ? `${payload.gamification.feedback_message.on_failure} — Hint: ${challenge.socratic_hint ?? ""}`
                    : " "}
              </p>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-2 min-h-[56px] rounded-full border-[3px] border-ink bg-accent2 px-6 py-2 text-lg font-black text-white shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
          >
            ✅ শেষ / বন্ধ
          </button>
        </div>
      )}
    </section>
  );
}
