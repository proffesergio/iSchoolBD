"use client";
import { useMemo, useState } from "react";
import { speakBangla } from "../../lib/store";

interface ParentGateProps {
  pageTitle: string;
  onPass: () => void;
  onClose: () => void;
}

/**
 * Parent gate for opt-in pages (Islamic section).
 * An adult-easy / kid-hard arithmetic question — no accounts, no PIN
 * to forget, works fully offline on a shared family phone.
 */
export function ParentGate({ pageTitle, onPass, onClose }: ParentGateProps) {
  const quiz = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 8);
    const b = 5 + Math.floor(Math.random() * 9);
    const answer = a + b;
    const distract = new Set<number>();
    while (distract.size < 2) {
      const d = answer + (Math.floor(Math.random() * 7) - 3);
      if (d !== answer && d > 0) distract.add(d);
    }
    const options = [...distract, answer].sort(() => Math.random() - 0.5);
    return { a, b, answer, options };
  }, []);

  const [wrong, setWrong] = useState(false);

  function choose(n: number): void {
    if (n === quiz.answer) {
      onPass();
    } else {
      setWrong(true);
      speakBangla("আবার চেষ্টা করো!");
      window.setTimeout(() => setWrong(false), 900);
    }
  }

  return (
    <section
      className={`mx-auto w-full max-w-md rounded-3xl border-4 border-ink bg-cream p-6 text-center shadow-[8px_8px_0_#16324f] ${wrong ? "shake" : ""}`}
      aria-label="Parent gate"
    >
      <div className="text-5xl" role="img" aria-label="Parent">
        👨‍👩‍👧
      </div>
      <h2 className="mt-2 font-bengali text-xl font-black">বাবা-মায়ের জন্য 🔒</h2>
      <p className="mt-1 font-bengali text-base opacity-80">
        “{pageTitle}” পাতা খুলতে এই অঙ্কটা মিলিয়ে দিন — বাচ্চাদের হাতে ফোন থাকলে নিরাপদে থাকবে।
      </p>
      <p className="mt-3 font-bengali text-3xl font-black" aria-live="polite">
        {quiz.a} + {quiz.b} = ?
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {quiz.options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => choose(n)}
            className="min-h-[56px] rounded-full border-[3px] border-ink bg-accent3 px-6 py-2 text-xl font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
          >
            {n}
          </button>
        ))}
      </div>
      {wrong && (
        <p className="mt-2 font-bengali text-sm" aria-live="polite">
          হয়নি — আবার চেষ্টা করো! 💪
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-3 min-h-[48px] rounded-full border-[3px] border-ink bg-white px-5 py-2 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
      >
        ← ফিরে যাই
      </button>
    </section>
  );
}
