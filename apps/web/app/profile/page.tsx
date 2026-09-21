"use client";
import Link from "next/link";
import { useTheme, type ThemeChoice } from "../../lib/theme";
import { useLearnerStore } from "../../lib/store";
import { clearStudentSession, getStudentSession, type StudentProfile } from "../../lib/student-auth";
import { useEffect, useState } from "react";

const CHOICES: { id: ThemeChoice; label: string }[] = [
  { id: "system", label: "📱 সিস্টেম" },
  { id: "light", label: "☀️ আলো" },
  { id: "dark", label: "🌙 অন্ধকার" },
];

export default function ProfilePage() {
  const { choice, setChoice } = useTheme();
  const xp = useLearnerStore((s) => s.xp);
  const streakDays = useLearnerStore((s) => s.streakDays);
  const [student, setStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    setStudent(getStudentSession()?.profile ?? null);
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <h1>👧 প্রোফাইল</h1>
      {student ? (
        <div className="sheet" style={{ textAlign: "left" }}>
          <p><strong>{student.avatar} {student.name}</strong> <small>({student.studentId})</small></p>
          <button className="btn ghost" onClick={() => { clearStudentSession(); setStudent(null); }}>বের হই</button>
        </div>
      ) : (
        <p><Link className="btn primary" href="/login">🔑 Student লগইন</Link></p>
      )}
      <div className="sheet" style={{ textAlign: "left" }}>
        <p>⭐ XP: <strong>{xp}</strong></p>
        <p>🔥 Streak: <strong>{streakDays} দিন</strong></p>
      </div>
      <h2>🎨 থিম</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="radiogroup" aria-label="Theme">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            role="radio"
            aria-checked={choice === c.id}
            className={choice === c.id ? "btn primary" : "btn ghost"}
            onClick={() => setChoice(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <h2>📲 অ্যাপ</h2>
      <p style={{ opacity: 0.75 }}>
        ফোনে হোম স্ক্রিনে যোগ করো — অফলাইনেও শেখা যাবে। Android-এ প্রম্পট আসবে, iPhone-এ Share → Add to Home Screen।
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link className="btn primary" href="/dashboard">🏆 ড্যাশবোর্ড</Link>
        <Link className="btn ghost" href="/admin">🛠️ অ্যাডমিন</Link>
      </div>
    </main>
  );
}
