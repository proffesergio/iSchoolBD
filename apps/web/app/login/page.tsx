"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getStudentSession,
  saveStudentProfile,
  studentLogin,
  type StudentClassId,
} from "../../lib/student-auth";

const CLASSES: { id: StudentClassId; label: string }[] = [
  { id: "preschool", label: "🍼 প্রি-স্কুল" },
  { id: "class-1", label: "📗 ১ম শ্রেণি" },
  { id: "class-2", label: "📘 ২য় শ্রেণি" },
  { id: "class-3", label: "📙 ৩য় শ্রেণি" },
  { id: "class-4", label: "📕 ৪র্থ শ্রেণি" },
  { id: "class-5", label: "📚 ৫ম শ্রেণি" },
];

const AVATARS = ["🦊", "🐰", "🐼", "🦁", "🐸", "🦄", "🐯", "🐨"];

export default function LoginPage() {
  const router = useRouter();
  // Deterministic first render ("login") so hydration matches the server;
  // session check runs after mount.
  const [step, setStep] = useState<"login" | "profile">("login");
  const [studentId, setStudentId] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [classId, setClassId] = useState<StudentClassId>("class-1");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getStudentSession()) setStep("profile");
  }, []);

  async function doLogin(): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      const session = await studentLogin(studentId, pin);
      if (session.profile) {
        router.push("/");
      } else {
        setStep("profile");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "লগইন ব্যর্থ");
    } finally {
      setBusy(false);
    }
  }

  async function doProfile(): Promise<void> {
    setError(null);
    if (!name.trim()) {
      setError("তোমার নাম লেখো ✨");
      return;
    }
    const session = getStudentSession();
    if (!session) {
      setStep("login");
      setError("আগে ID + PIN দিয়ে লগইন করো।");
      return;
    }
    setBusy(true);
    try {
      await saveStudentProfile(session.token, { name: name.trim(), classId, avatar });
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "প্রোফাইল সেভ হয়নি");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 14px 110px" }}>
      <h1>🔑 শিক্ষার্থী লগইন</h1>
      {step === "login" ? (
        <div className="sheet" style={{ textAlign: "left" }}>
          <p style={{ opacity: 0.75 }}>শিক্ষক/অ্যাডমিনের দেওয়া Student ID + PIN দাও।</p>
          <div className="admin-grid">
            <input
              placeholder="Student ID (rahim-01)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              autoComplete="username"
              aria-label="Student ID"
            />
            <input
              type="password"
              inputMode="numeric"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
              autoComplete="current-password"
              aria-label="PIN"
            />
          </div>
          <button className="btn primary" onClick={doLogin} disabled={busy} style={{ marginTop: 10 }}>
            {busy ? "…" : "ঢুকি 🚀"}
          </button>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          <p style={{ opacity: 0.7 }}>ID/PIN নেই? অ্যাডমিনকে বলো — সেটআপ docs/ADMIN.md §8-এ।</p>
        </div>
      ) : (
        <div className="sheet" style={{ textAlign: "left" }}>
          <h2>👋 প্রথমবার? প্রোফাইল বানাও</h2>
          <div className="admin-grid">
            <input
              placeholder="তোমার নাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Name"
            />
            <select value={classId} onChange={(e) => setClassId(e.target.value as StudentClassId)} aria-label="Class">
              {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }} role="radiogroup" aria-label="Avatar">
            {AVATARS.map((a) => (
              <button
                key={a}
                role="radio"
                aria-checked={avatar === a}
                onClick={() => setAvatar(a)}
                style={{
                  fontSize: 28, borderRadius: 12, border: avatar === a ? "3px solid var(--accent2)" : "3px solid transparent",
                  background: "transparent", cursor: "pointer",
                }}
              >
                {a}
              </button>
            ))}
          </div>
          <button className="btn primary" onClick={doProfile} disabled={busy} style={{ marginTop: 10 }}>
            {busy ? "…" : "শেখা শুরু করি 🎉"}
          </button>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </div>
      )}
      <p><Link href="/">← হোমে ফিরি</Link></p>
    </main>
  );
}
