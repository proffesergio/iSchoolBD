# Sprint 1.6 — Universal login, theme, TTS (REQUIRED before Sprint 2)

Status: **built, 20 API + 46 web tests green, both builds pass.**

## Admin: fix your login first (5 min, docs/ADMIN.md §7)
- [ ] Open `/admin` — read the API base + status line under the key box
- [ ] ❌ down + localhost URL → set `NEXT_PUBLIC_API_BASE` on **web** project → redeploy web
- [ ] `ভুল কী` → re-copy `ADMIN_API_KEY` byte-for-byte into the box
- [ ] `Admin is disabled` → set `ADMIN_API_KEY` on **API** project → redeploy API
- [ ] Still failing → latest deployment check + incognito (stale deploy/cache)

## Student login tasks
- [x] Backend: `StudentAuthService` (env roster, timing-safe PIN, HMAC tokens) + `StudentGuard`
- [x] `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile` + 4 e2e tests
- [x] Web `/login`: ID+PIN → first-login profile creation (name, class, avatar)
- [x] Homepage: universal browse for guests; logged-in class 1–5 students get
      personalized hero + "আমার শ্রেণির পড়া" shelf (little-kid vs explorer tone)
- [x] Dashboard + profile use student identity (server summary, else device data)
- [ ] Set `STUDENT_ACCOUNTS` on API project → redeploy (human)
- [ ] Create `student_profiles` table in Supabase for persistence (SQL in ADMIN.md §8)
- [ ] Distribute IDs/PINs to first test students, verify /login → /dashboard flow on phone

## Theme + TTS tasks
- [x] Dark theme: light surfaces keep dark text (`.pill/.sheet/.btn`); tailwind
      `bg-white/bg-cream` adapt under `[data-theme="dark"]`
- [x] TTS policy (`lib/tts-policy.ts` + tests): autoplay only pre–class 2
- [x] QuizSheet (class 3+): autoplay removed, tap-to-hear 🔊 buttons added
- [x] ParentGate: speech removed (visual only); TalkingLetter + BookPage taps kept
- [x] Voice-over fields: API `audioUrl/audioText` + validation, admin form + preview,
      `VoiceButton` component, web `LessonRef` fields
- [ ] Phone QA in dark mode (all tabs) + confirm silence on class 3+ (human)

## Sprint 2 GO criteria
- [ ] Admin login works (this file's first section)
- [ ] One test student logs in and sees their class shelf
- [ ] Then: run `scripts/seed-sprint2-class1.mjs`, continue Class-1 batches
