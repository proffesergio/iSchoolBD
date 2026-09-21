"use client";
import { useMemo, useState } from "react";
import type { BookItem, BookLang, BookPageDef } from "../../lib/book-pages";
import {
  TTS_LANG,
  pageTitle,
  praiseText,
  questionPrompt,
  retryText,
} from "../../lib/book-pages";
import {
  LISTENS_TO_UNLOCK,
  queueSpeak,
  speakWithLang,
  useLearnerStore,
} from "../../lib/store";

interface BookPageProps {
  page: BookPageDef;
  /** letter books delegate taps to the rich TalkingLetterSheet */
  onOpenLetter?: (letter: string) => void;
  onClose: () => void;
}

/**
 * One "page" of the digital talking book — the iSchool touch-button grid.
 * Read mode: 1st tap speaks the name only (spell-first); 2nd tap adds the
 * word/meaning sentence. ❓ Question mode unlocks after LISTENS_TO_UNLOCK
 * total listens and asks "X কোথায়?" in quiz mode.
 */
export function BookPage({ page, onOpenLetter, onClose }: BookPageProps) {
  const [uiLang, setUiLang] = useState<BookLang>(page.defaultLang);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQ, setCurrentQ] = useState<string | null>(null);
  const [result, setResult] = useState<"idle" | "good" | "bad">("idle");

  const listenedLetters = useLearnerStore((s) => s.listenedLetters);
  const counts = useLearnerStore((s) => s.listenCounts);

  const visibleItems = useMemo(
    () => page.items.filter((it) => !it.lang || it.lang === uiLang),
    [page, uiLang]
  );

  const totalListens = useMemo(
    () => page.items.reduce((n, it) => n + (counts[it.id] ?? 0), 0),
    [page, counts]
  );
  const quizUnlocked = page.quiz && totalListens >= LISTENS_TO_UNLOCK;
  const remaining = Math.max(0, LISTENS_TO_UNLOCK - totalListens);

  function itemName(item: BookItem): string {
    return item.name[uiLang] ?? item.name[page.defaultLang] ?? item.id;
  }

  function tapItem(item: BookItem): void {
    if (quizMode) {
      answerQuiz(item);
      return;
    }
    if (page.sheet && onOpenLetter && item.sheetLetter) {
      onOpenLetter(item.sheetLetter);
      return;
    }
    if (page.kind === "rhymes") {
      const lines = item.detail?.[uiLang] ?? item.detail?.[page.defaultLang];
      if (lines) speakWithLang(`${itemName(item)}. ${lines}`, TTS_LANG[uiLang], 0.9);
      useLearnerStore.getState().recordListen(item.id);
      return;
    }
    const store = useLearnerStore.getState();
    const prior = store.listenCount(item.id);
    const detail = item.detail?.[uiLang] ?? item.detail?.[page.defaultLang];
    if (prior >= 1 && detail) {
      speakWithLang(`${itemName(item)}. ${detail}`, TTS_LANG[uiLang], 0.9);
    } else {
      speakWithLang(itemName(item), TTS_LANG[uiLang], 0.8);
    }
    store.recordListen(item.id);
  }

  function startQuiz(): void {
    setQuizMode(true);
    setResult("idle");
    askNew(null);
  }

  function stopQuiz(): void {
    setQuizMode(false);
    setCurrentQ(null);
    setResult("idle");
  }

  function askNew(excludeId: string | null): void {
    const pool = visibleItems.filter((it) => it.id !== excludeId);
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return;
    setCurrentQ(pick.id);
    const nm = pick.name[uiLang] ?? pick.name[page.defaultLang] ?? pick.id;
    speakWithLang(questionPrompt(uiLang, nm), TTS_LANG[uiLang], 0.85);
  }

  function answerQuiz(item: BookItem): void {
    if (!currentQ) return;
    const store = useLearnerStore.getState();
    if (item.id === currentQ) {
      store.addXp(10, 1);
      store.markSeen(`book:${page.id}`);
      setResult("good");
      speakWithLang(praiseText(uiLang), TTS_LANG[uiLang]);
      window.setTimeout(() => {
        setResult("idle");
        askNew(currentQ);
      }, 1300);
    } else {
      setResult("bad");
      speakWithLang(retryText(uiLang), TTS_LANG[uiLang]);
      window.setTimeout(() => setResult("idle"), 900);
    }
  }

  return (
    <section
      className={`mx-auto w-full max-w-2xl rounded-3xl border-4 border-ink bg-cream p-5 text-center shadow-[8px_8px_0_#16324f] ${result === "bad" ? "shake" : result === "good" ? "sparkle" : ""}`}
      aria-label={`Book page ${pageTitle(page, uiLang)}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={quizMode ? stopQuiz : onClose}
          aria-label={quizMode ? "Exit quiz" : "Close book"}
          className="rounded-full border-[3px] border-ink bg-white px-3 py-1 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
        >
          {quizMode ? "✕ খেলা শেষ" : "← তাক"}
        </button>
        <h2 className="font-bengali text-xl font-black">
          {page.cover} {pageTitle(page, uiLang)}
        </h2>
        <span className="rounded-full border-[3px] border-ink bg-white px-3 py-1 text-sm font-extrabold">
          {quizMode ? "❓ প্রশ্ন!" : `👆 ${visibleItems.length} বোতাম`}
        </span>
      </div>

      {/* Language switch — বাংলা / English / عربي */}
      {page.langs.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-2" role="group" aria-label="Language">
          {(["bn", "en", "ar"] as const)
            .filter((l) => page.langs.includes(l))
            .map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setUiLang(l);
                  stopQuiz();
                }}
                aria-pressed={uiLang === l}
                className={`min-h-[44px] rounded-full border-[3px] border-ink px-4 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5 ${
                  uiLang === l ? "bg-accent2 text-white" : "bg-white"
                }`}
              >
                {l === "bn" ? "বাংলা" : l === "en" ? "English" : "عربي"}
              </button>
            ))}
        </div>
      )}

      {page.kind === "rhymes" ? (
        <>
          <button
            type="button"
            onClick={() => {
              const lines = visibleItems
                .map((it) => it.detail?.[uiLang] ?? it.detail?.[page.defaultLang])
                .filter((t): t is string => typeof t === "string" && t.length > 0);
              queueSpeak(lines, TTS_LANG[uiLang], 0.9);
            }}
            className="mt-3 min-h-[56px] rounded-full border-[3px] border-ink bg-accent2 px-6 py-2 text-lg font-black text-white shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
          >
            ▶️ সবগুলো বাজাও
          </button>
          <div className="mt-3 flex flex-col gap-2 text-left">
          {visibleItems.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => tapItem(it)}
              className="flex min-h-[60px] items-center gap-3 rounded-2xl border-[3px] border-ink bg-white px-4 py-2 text-left shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
            >
              <span className="text-3xl" role="img" aria-hidden="true">
                {listenedLetters.includes(it.id) ? "✅" : "▶️"}
              </span>
              <span>
                <span className="block font-bengali font-black">{itemName(it)}</span>
                <span className="block font-bengali text-sm opacity-70">
                  {it.detail?.[uiLang] ?? it.detail?.[page.defaultLang] ?? ""}
                </span>
              </span>
            </button>
          ))}
          </div>
        </>
      ) : (
        <>
          {/* ❓ Question key */}
          {page.quiz &&
            (quizUnlocked ? (
              !quizMode && (
                <button
                  type="button"
                  onClick={startQuiz}
                  className="mt-3 min-h-[56px] rounded-full border-[3px] border-ink bg-accent3 px-6 py-2 text-lg font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
                >
                  ❓ প্রশ্ন খেলি!
                </button>
              )
            ) : (
              <p className="mt-3 font-bengali text-sm opacity-70" aria-live="polite">
                🔒 {remaining} বার ছুঁয়ে শুনলে ❓ প্রশ্ন-খেলা খুলবে
              </p>
            ))}

          {quizMode && currentQ && (
            <>
              <p className="mt-3 min-h-6 font-bengali font-extrabold" aria-live="polite">
                {result === "good"
                  ? praiseText(uiLang)
                  : result === "bad"
                    ? retryText(uiLang)
                    : "👆 শুনে সঠিকটায় চাপ দাও!"}
              </p>
              <button
                type="button"
                onClick={() => {
                  const q = visibleItems.find((it) => it.id === currentQ);
                  if (!q) return;
                  const nm = q.name[uiLang] ?? q.name[page.defaultLang] ?? q.id;
                  speakWithLang(questionPrompt(uiLang, nm), TTS_LANG[uiLang], 0.85);
                }}
                className="mt-1 min-h-[48px] rounded-full border-[3px] border-ink bg-white px-5 py-1 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
              >
                🔁 প্রশ্নটা আবার শোনো
              </button>
            </>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {visibleItems.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => tapItem(it)}
                aria-label={itemName(it)}
                className={`flex min-h-[84px] flex-col items-center justify-center rounded-2xl border-[3px] border-ink px-1 py-2 shadow-[3px_3px_0_#16324f] transition-transform active:translate-y-0.5 ${
                  currentQ === it.id && quizMode
                    ? "bg-accent3"
                    : listenedLetters.includes(it.id)
                      ? "bg-green-100"
                      : "bg-white"
                }`}
              >
                <span className="text-4xl" role="img" aria-hidden="true">
                  {it.emoji}
                </span>
                <span className="font-bengali text-lg font-black leading-tight">
                  {itemName(it)}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
