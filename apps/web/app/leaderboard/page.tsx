"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../lib/admin-client";
import { currentUserId } from "../../lib/chapter-progress";

interface Row {
  rank: number;
  user_id: string;
  xp: number;
  chapters: number;
}

const TABS = [
  { id: "all", bn: "সব" },
  { id: "class-1", bn: "১ম" },
  { id: "class-2", bn: "২য়" },
  { id: "class-3", bn: "৩য়" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

/** Weekly class leaderboard — XP earned on chapters in the last 7 days. */
export default function LeaderboardPage() {
  const [classId, setClassId] = useState("all");
  const [rows, setRows] = useState<Row[]>([]);
  const [yourRank, setYourRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (cls: string) => {
    setLoading(true);
    try {
      const me = currentUserId();
      const r = await fetch(
        `${API_BASE}/leaderboard?classId=${encodeURIComponent(cls)}&limit=20&user_id=${encodeURIComponent(me)}`,
        { cache: "no-store" }
      );
      if (!r.ok) throw new Error("bad");
      const j = await r.json();
      setRows(j.rows ?? []);
      setYourRank(j.yourRank ?? null);
    } catch {
      setRows([]);
      setYourRank(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(classId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "14px 14px 110px" }}>
      <p><Link href="/courses">← কোর্স</Link></p>
      <h1>🏆 লিডারবোর্ড</h1>
      <p style={{ opacity: 0.75 }}>গত ৭ দিনে অধ্যায় থেকে XP — সাপ্তাহিক প্রতিযোগিতা! 🔥</p>
      <div className="pro-filters" role="tablist" aria-label="Leaderboard class">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={classId === t.id}
            className={classId === t.id ? "pro-filter active" : "pro-filter"}
            onClick={() => setClassId(t.id)}
          >
            {t.bn}
          </button>
        ))}
      </div>
      {yourRank !== null && <p className="pill" style={{ display: "inline-block", marginTop: 10 }}>তোমার র‍্যাংক: #{yourRank} 🎯</p>}
      {loading ? (
        <p>লোড হচ্ছে… ⏳</p>
      ) : rows.length === 0 ? (
        <div className="sheet">
          <p>এখনো কেউ খেলেনি — প্রথম হও! 🚀</p>
          <Link className="btn primary" href="/courses">কুইজ খেলি</Link>
        </div>
      ) : (
        <ol style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
          {rows.map((r) => (
            <li
              key={r.user_id}
              className="card"
              style={{
                fontSize: 16, display: "flex", gap: 10, alignItems: "center",
                padding: "10px 14px", textAlign: "left", animation: "none",
                borderColor: r.rank <= 3 ? "var(--cos-gold)" : undefined,
              }}
            >
              <span style={{ fontSize: 22 }}>{MEDAL[r.rank - 1] ?? `#${r.rank}`}</span>
              <span style={{ flex: 1 }}><strong>{r.user_id}</strong></span>
              <small>{r.chapters} অধ্যায়</small>
              <strong>⭐ {r.xp}</strong>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
