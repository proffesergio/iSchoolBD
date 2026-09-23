"use client";
import { useEffect, useState } from "react";
import { completedToday, loadProgress } from "../../lib/chapter-progress";

/** Day-by-day hook: one chapter a day keeps the streak flame alive. */
export function DailyMission() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(completedToday(loadProgress()).length > 0);
  }, []);

  // Deterministic first render (mission pending) so hydration matches.
  return (
    <div className="sheet" style={{ textAlign: "left" }} aria-live="polite">
      <strong>🎯 আজকের মিশন: ১টি অধ্যায় শেষ করো</strong>
      <p style={{ margin: "4px 0 0", opacity: 0.75 }}>
        {done ? "✅ সম্পন্ন! কাল আবার এসো 🔥" : "⏳ বাকি — প্রতিদিন একটু একটু! 🌱"}
      </p>
    </div>
  );
}
