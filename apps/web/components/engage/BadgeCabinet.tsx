"use client";
import { useEffect, useState } from "react";
import { BADGES, earnedBadges } from "../../lib/badges";
import { loadProgress } from "../../lib/chapter-progress";
import { useLearnerStore } from "../../lib/store";

/** Earned badges glow; locked ones are dimmed. Deterministic first render. */
export function BadgeCabinet() {
  const [earned, setEarned] = useState<string[]>([]);
  const streakDays = useLearnerStore((s) => s.streakDays);

  useEffect(() => {
    setEarned(earnedBadges(loadProgress(), useLearnerStore.getState().streakDays));
  }, [streakDays]);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} aria-label="Badge cabinet">
      {BADGES.map((b) => {
        const has = earned.includes(b.id);
        return (
          <span
            key={b.id}
            className="pill"
            title={`${b.bn} — ${b.en}`}
            style={{ fontSize: 14, opacity: has ? 1 : 0.45, filter: has ? "none" : "grayscale(1)" }}
          >
            {b.emoji} {b.bn}
          </span>
        );
      })}
    </div>
  );
}
