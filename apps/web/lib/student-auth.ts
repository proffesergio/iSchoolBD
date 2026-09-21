import { publicApi } from "./admin-client";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export type StudentClassId = "preschool" | "class-1" | "class-2" | "class-3" | "class-4" | "class-5";

export interface StudentProfile {
  studentId: string;
  name: string;
  classId: StudentClassId;
  avatar: string;
}

export interface StudentSession {
  token: string;
  studentId: string;
  profile: StudentProfile | null;
}

const TOKEN_KEY = "ischool-student-token";
const PROFILE_KEY = "ischool-student-profile";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function req<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(body.slice(0, 160) || `Request failed (${r.status})`);
  }
  return (await r.json()) as T;
}

/** ID + PIN login. Throws Bengali-friendly errors the /login page shows. */
export async function studentLogin(studentId: string, pin: string): Promise<StudentSession> {
  let out: { token: string; studentId: string; firstLogin: boolean; profile: StudentProfile | null };
  try {
    out = await req("/auth/login", undefined, {
      method: "POST",
      body: JSON.stringify({ studentId: studentId.trim().toLowerCase(), pin }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/Failed to fetch|NetworkError|Load failed/.test(msg)) {
      throw new Error("সার্ভারে পৌঁছানো যাচ্ছে না — ইন্টারনেট দেখো।");
    }
    if (/Wrong student ID or PIN/.test(msg)) throw new Error("ভুল ID বা PIN — আবার চেষ্টা করো।");
    if (/disabled/.test(msg)) throw new Error("লগইন এখনো চালু হয়নি — অ্যাডমিনকে বলো।");
    throw new Error("লগইন ব্যর্থ — আবার চেষ্টা করো।");
  }
  const session: StudentSession = { token: out.token, studentId: out.studentId, profile: out.profile };
  storage()?.setItem(TOKEN_KEY, out.token);
  if (out.profile) storage()?.setItem(PROFILE_KEY, JSON.stringify(out.profile));
  return session;
}

export async function saveStudentProfile(
  token: string,
  input: { name: string; classId: StudentClassId; avatar: string }
): Promise<StudentProfile> {
  const profile = await req<StudentProfile>("/auth/profile", token, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  storage()?.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function getStudentSession(): StudentSession | null {
  const s = storage();
  const token = s?.getItem(TOKEN_KEY);
  if (!token) return null;
  const studentId = token.split(".")[0] ?? "";
  let profile: StudentProfile | null = null;
  try {
    const raw = s?.getItem(PROFILE_KEY);
    profile = raw ? (JSON.parse(raw) as StudentProfile) : null;
  } catch { /* corrupted — treat as no profile */ }
  return { token, studentId, profile };
}

export function clearStudentSession(): void {
  storage()?.removeItem(TOKEN_KEY);
  storage()?.removeItem(PROFILE_KEY);
}

export { publicApi };
