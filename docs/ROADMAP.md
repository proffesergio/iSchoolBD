# iSchool Roadmap — UI upgrade, curriculum growth & video platform

Locked decisions (2026-09-21): video MVP covers **YouTube + Drive + Terabox**;
curriculum expands **Class 1–3 core (Bangla, Math, English)** first; mobile shell is
**5 tabs (Home, Courses, Search, Videos, Profile)**; theme is **system-default +
toggle** with **platform-smart PWA prompt** (Android `beforeinstallprompt`,
iOS Share → Add to Home Screen guide); delivery is **weekly sprints** with
**per-feature CI**.

## Epics

### A — Brand cleanup (DONE, Sprint 1)
- [x] Remove all Zayan / external-source references (3 files + 2 metaphor comments)
- [x] Hero copy is source-agnostic; content model is iSchool-original

### B — Mobile shell (foundation DONE, polish in Sprint 2)
- [x] `lib/theme.tsx` — system default, light/dark toggle, persisted
- [x] `components/ui/BottomNav.tsx` — 5 tabs, active state via pathname
- [x] `components/pwa/InstallPrompt.tsx` — Android native prompt, iOS guide, once-per-device
- [x] `manifest.json` — shortcuts for Courses/Videos/Search/Profile
- [x] Dark-theme CSS vars, safe-area padding, desktop top-bar fallback
- [ ] Sprint 2: route transitions, skeleton loaders, a11y audit (focus states, contrast)
- [ ] Sprint 2: PWA icons (192/512 PNG), offline pack for core lessons, `sw.js` versioned cache

### C — Curriculum expansion (schema + seeds DONE, content Sprint 2–5)
- [x] `lib/curriculum.ts` — class → subject → chapter → lesson schema + validation
- [x] Seeds: 9 courses (3 classes × 3 subjects), 18 chapters, 54 lessons
- [ ] Per chapter (repeat ×N): content task → review task → video-link task → QA task.
      18 seed chapters × 4 = 72 tasks; full NCTB coverage (~8 chapters × 9 courses = 72
      chapters) × 4 ≈ **290 tasks**, plus per-lesson authoring (~430 lessons × 2) ≈ **860**.
- [ ] Sprint 2: Class 1 full coverage (all chapters per NCTB)
- [ ] Sprint 3: Class 2 full coverage
- [ ] Sprint 4: Class 3 full coverage
- [ ] Sprint 5: quizzes + Socratic hints for every lesson (validate via `validateTrack`-style checks)

### D — Video platform (foundation DONE, importer + catalog Sprint 3–6)
- [x] `lib/video-sources.ts` — YouTube/Drive/Terabox/direct parsers, embed builders, auto-structuring
- [x] `components/video/CoursePlayer.tsx` — Udemy-style sidebar + full transport controls + resume
- [x] `lib/video-catalog.ts` — registry (demo links — replace before launch)
- [x] `/videos` route wired to catalog
- [ ] Sprint 3: teacher paste-link flow (URL → `parseVideoLink` → append to catalog draft)
- [ ] Sprint 4: YouTube playlist importer API (`apps/api` route, needs `YOUTUBE_API_KEY` env)
- [ ] Sprint 5: Drive bulk import (folder link → file list → `structureImport`)
- [ ] Sprint 6: Terabox direct-URL resolver docs + per-lecture fallback UX; catalog to 50+ courses.
      Per course: sourcing (1) + structuring (1) + metadata (1) + QA (1) ≈ 4 tasks × 50 = **200 tasks**.
- [ ] Player upgrades: watch-speed memory, subtitles track, background-audio mode, kids-lock

### E — CI/CD & release (DONE foundation, gates every sprint)
- [x] `feature-curriculum` + `feature-video` CI jobs (per-feature green signals)
- [x] Existing `engine` / `api` / `web` jobs (test + build)
- [ ] Each sprint deploys behind the same gates: feature jobs → web build → Vercel preview →
      manual QA on phone (bottom nav, theme, install prompt) → promote to production
- [ ] Sprint 6: Play Store (TWA) checklist; Sprint 7: analytics + crash reporting

## Weekly sprint plan
| Sprint | Focus | Exit criteria (must be green) |
|---|---|---|
| 1 (done) | Shell + schema + player + backlog | 39 tests pass, web build green, CI extended |
| 1.5 (done) | Control plane: backend catalog, /admin, /dashboard | 15 API + 44 web tests green, feature-admin CI, ADMIN.md |
| 1.6 (done) | Universal login + personalization: student ID/PIN auth, class-based homepage, dark-theme fix, TTS policy + voice-overs | 20 API + 46 web tests green, /login + /dashboard identity, ADMIN.md §7–9 |
| 1.7 (done) | Reliability + galactic theme: stale-chunk 236.js remedy, cosmic design system (nebula/starfield/constellation, glass nav, gradient hero) | 50 web tests green, all chunks verified resolving |
| 1.8 (done) | Contextual animated header: rotating randomized headlines (universal + class-aware), eyebrow greeting, reduced-motion static; modern spaced hero rhythm | 54 web tests green, build green |
| 1.9 (done) | Admin login fix: dotenv loader (`.env.local` now read), Supabase-missing fallbacks, panel diagnostics | 21 API tests green, live-verified STATS/STUDENTS 200 |
| 1.10 (done) | Pro admin dashboard (reference pattern): dark sidebar, stat cards, activity chart, course rings, subject filters, pro login | 58 web tests green, build green |
| 1.11 (done) | Full control plane: course/chapter/video-course/section CRUD in API + panel; hydration fixes (deterministic first render); dark-theme hex audit | 22 API + 58 web tests green, build green |
| 2 (started) | Class 1 content via admin API (seed script batch 1) + PWA icons/offline | catalog reads show new chapters, Lighthouse PWA ≥ 90 |
| 3 | Class 2 content + paste-link flow | video job green, 10 real courses in catalog |
| 4 | Class 3 content + YT importer API | api job green, playlist → course e2e works |
| 5 | Quizzes/hints + Drive import | all content validated, 30 courses |
| 6 | Terabox hardening + catalog 50 | player fallback UX verified on device |
| 7 | Polish, a11y, store readiness | release checklist signed off |

## New env vars (when importer lands)
| Key | Where | Purpose |
|---|---|---|
| `YOUTUBE_API_KEY` | API project | playlist importer (Sprint 4) |
| `ADMIN_API_KEY` | API project (all envs) | admin control plane (Sprint 1.5, required) |
| `STUDENT_ACCOUNTS` | API project (all envs) | student ID:PIN roster for /login (Sprint 1.6) |
| `STUDENT_TOKEN_SECRET` | API project (optional) | login token signing (else ADMIN_API_KEY) |
| _(none new for web)_ | — | panel key stays in sessionStorage, never env |

## Task scale
Content tasks dominate: ~860 (lessons) + ~290 (chapters) + ~200 (video courses) +
~120 (shell/player polish + QA) ≈ **1,400+ tasks** across Sprints 2–7. New sprints
append chapter/course batches to this file — schema and CI already accept them.
