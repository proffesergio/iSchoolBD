"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { publicApi, type ProgressSummary } from "../../lib/admin-client";
import { BadgeCabinet } from "../../components/engage/BadgeCabinet";
import { getStudentSession } from "../../lib/student-auth";
import { summarize, topicLabel, type DashboardStats } from "../../lib/analytics";
import { supabaseBrowser } from "../../lib/supabaseClient";
import { useLearnerStore } from "../../lib/store";

function Ring({ pct, label }: { pct: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={label}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" strokeWidth="14" className="ring-track" />
        <circle
          cx="70" cy="70" r={r} fill="none" strokeWidth="14" strokeLinecap="round"
          className="ring-fill"
          strokeDasharray={c}
          strokeDashoffset={c - (Math.min(100, Math.max(0, pct)) / 100) * c}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="ring-center">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const xp = useLearnerStore((s) => s.xp);
  const streakDays = useLearnerStore((s) => s.streakDays);
  const listenedLetters = useLearnerStore((s) => s.listenedLetters);
  const [server, setServer] = useState<ProgressSummary | null>(null);
  const [user, setUser] = useState<string | null>(null);
  // Clock reads after mount only — server and first client render share
  // the fixed epoch so hydration matches.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    useLearnerStore.getState().hydrate();
    // Student login first (counts as the Student row), Supabase second, guest last.
    const session = getStudentSession();
    if (session?.profile) {
      setUser(`${session.profile.avatar} ${session.profile.name}`);
      publicApi.summary(session.studentId || session.profile.name).then(setServer).catch(() => undefined);
      return;
    }
    if (session) {
      setUser(session.studentId);
      publicApi.summary(session.studentId).then(setServer).catch(() => undefined);
      return;
    }
    const sb = supabaseBrowser();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => {
      const id = data.user?.email ?? data.user?.phone ?? null;
      setUser(id);
      if (id) publicApi.summary(id).then(setServer).catch(() => undefined);
    });
  }, []);

  const stats: DashboardStats = useMemo(() => {
    const at = now ?? new Date(0);
    if (server && server.entries.length > 0) return summarize(server.entries, at);
    return summarize(
      listenedLetters.map((t, i) => ({
        user_id: "guest", topic: t, xp: 1, progress_percentage: 5,
        streak_days: streakDays,
        updated_at: new Date(at.getTime() - i * 86400000).toISOString(),
      })),
      at
    );
  }, [server, listenedLetters, streakDays, now]);

  const displayXp = server ? stats.totalXp : xp;
  const maxBar = Math.max(1, ...stats.weeklyXp);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <p style={{ opacity: 0.7 }}>{user ? `👧 ${user}` : "🐣 গেস্ট মোড — লগইন করলে সব ডিভাইসে সেভ থাকবে"}</p>
      <h1 className="sparkle">🏆 আমার ড্যাশবোর্ড</h1>

      <div className="dash-hero sheet">
        <Ring pct={stats.levelProgress} label={`Lv ${stats.level}`} />
        <div style={{ textAlign: "left" }}>
          <p><strong>⭐ {displayXp} XP</strong> <small>({stats.xpIntoLevel}/{stats.xpIntoLevel + stats.xpForNext} — আর {stats.xpForNext} পেলেই Lv {stats.level + 1}!)</small></p>
          <p>🔥 Streak: <strong>{Math.max(streakDays, stats.streakDays)} দিন</strong></p>
          <p>🌱 টপিক: <strong>{stats.topicsCompleted}</strong></p>
        </div>
      </div>

      <h2>📊 গত ৭ দিন</h2>
      <div className="bars" role="img" aria-label="Weekly XP chart">
        {stats.weeklyXp.map((v, i) => (
          <div key={i} className="bar-col">
            <div className="bar" style={{ height: `${Math.round((v / maxBar) * 100)}%` }} title={`${v} XP`} />
            <small>{["৬", "৫", "৪", "৩", "২", "১", "আ"][i]}</small>
          </div>
        ))}
      </div>

      {stats.perTopic.length > 0 && (
        <>
          <h2>📚 টপিক অনুযায়ী</h2>
          <ul className="admin-list">
            {stats.perTopic.map((t) => (
              <li key={t.topic}><span>{topicLabel(t.topic)}</span><span>⭐ {t.xp}</span></li>
            ))}
          </ul>
        </>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <Link className="btn primary" href="/courses">শিখতে থাকো 📚</Link>
        <Link className="btn ghost" href="/videos">ভিডিও দেখো 🎬</Link>
        <Link className="btn ghost" href="/leaderboard">🏆 লিডারবোর্ড</Link>
      </div>

      <h2>🏅 ব্যাজ ক্যাবিনেট</h2>
      <BadgeCabinet />
      {!user && <p style={{ opacity: 0.7 }}>💡 হোম থেকে 🔑 লগইন করো — তুমি Student হিসেবে গোনা হবে!</p>}
    </main>
  );
}
