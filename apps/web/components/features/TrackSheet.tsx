"use client";
import { useState } from "react";
import type { TrackDef } from "../../lib/tracks";
import { useLearnerStore } from "../../lib/store";
import { QuizSheet } from "./QuizSheet";

interface TrackSheetProps {
  track: TrackDef;
  onClose: () => void;
}

/**
 * Track picker → QuizSheet. Lists lessons with ✅ state so learners
 * (and parents) see exactly where they stand in each Tier 2/3 track.
 */
export function TrackSheet({ track, onClose }: TrackSheetProps) {
  const [active, setActive] = useState<number | null>(null);
  const seenTopics = useLearnerStore((s) => s.seenTopics);

  if (active !== null) {
    return <QuizSheet track={track} startAt={active} onExit={() => setActive(null)} />;
  }

  return (
    <section
      className="mx-auto w-full max-w-xl rounded-3xl border-4 border-ink bg-cream p-5 text-center shadow-[8px_8px_0_#16324f]"
      aria-label={`Track ${track.titleBn}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="font-bengali text-xl font-black">
          {track.cover} {track.titleBn}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close track"
          className="rounded-full border-[3px] border-ink bg-white px-3 py-1 font-black shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
        >
          ✕
        </button>
      </div>
      <p className="font-bengali text-sm opacity-70">
        {track.titleEn} • {track.lessons.length} পাঠ • +{track.baseXp} XP প্রতি পাঠ
      </p>
      <p className="mt-1 font-bengali text-base">🗣️ {track.coachLine}</p>
      <div className="mt-3 flex flex-col gap-2 text-left">
        {track.lessons.map((l, i) => {
          const done = seenTopics.includes(`lesson:${track.id}:${l.id}`);
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setActive(i)}
              className="flex min-h-[60px] items-center gap-3 rounded-2xl border-[3px] border-ink bg-white px-4 py-2 text-left shadow-[3px_3px_0_#16324f] active:translate-y-0.5"
            >
              <span className="text-2xl font-black" aria-hidden="true">
                {done ? "✅" : `${i + 1}.`}
              </span>
              <span>
                <span className="block font-bengali font-black">{l.prompt}</span>
                <span className="block font-bengali text-xs opacity-70">{l.topic}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
