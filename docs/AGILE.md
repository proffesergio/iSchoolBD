# AGILE — iSchool BD: Talking Book → Production MVP

**North star:** a 3-year-old taps any letter, hears ONLY that letter slowly, and graduates to words → quiz at her own pace — then grows with the same app to board-exam physics. No login, no paywall, works offline on a cheap Android phone.

**Cadence:** 1-week sprints. Board: To Do → In Progress → In Review → Done.
**Story rule:** a story counts only if schema-valid + tested + kid-tappable (≥56px targets, TTS verified in-lang).
**Ceremonies:** planning (Mon), async standup (#ischool-standup), kid-tested demo (Fri — one real child + screen recording), retro (Fri).

## Production MVP — Definition of Done
- [x] Tier 1 talking-book shell: shelf → page → spell-first cards → ❓ question mode (offline after first visit)
- [x] Tier 2 starter: Class-3 addition track (8 lessons, Apu tone, ৳ contexts)
- [x] Tier 3 starters: physics motion (5) + chemistry atoms (3) + ICT computer (3) + AI intro (3), Socratic hints validated leak-free
- [ ] Progress persists per device (localStorage ✅ shipped) + per account on login (Neon sync — open)
- [ ] PWA installable w/ raster icons, Lighthouse ≥90 on Moto G4 emulation, TTS in Chrome Android WebView
- [ ] Teacher safety + NCTB sign-off (gated Islamic section reviewed)
- [ ] Deployed: web on Vercel, API on free-tier host, Neon production, status in README

## Sprint 1 — Learn-first + talking-book shell (DONE)
- [x] `TalkingLetterSheet`: শোনো (spell-only TTS 0.75) → শব্দ → খেলা, unlock after 2 listens
- [x] Bookshelf home: 9 pages (স্বরবর্ণ, 38-letter ব্যঞ্জনবর্ণ, English A–Z, আরবি 28, সংখ্যা 1–20, কার-ফলা, animals, 8 rhymes, gated Islamic) + 5 track cards
- [x] Trilingual toggle (bn/en/ar) + ❓ question mode + rhymes play-all + quiz repeat
- [x] ParentGate (arithmetic) for the Islamic section; 5 surahs + 15 names + duas onboard
- [x] TraceCanvas (finger tracing, 60% coverage pass, +5 XP) wired into the sheet
- [x] localStorage persistence (forgiving loader, quota-safe) + 27/27 web tests + tsc + both builds green
- [ ] Kid test #1 (carried): 1 child, 5 letters — taps-to-first-replay, confusion points → tune threshold/rate

## Sprint 2 — Depth + E2E (next)
- Kid test #1 first, then tune `LISTENS_TO_UNLOCK` / TTS rates from notes
- Tracing rollout to কার-ফলা + numbers pages (component already generic)
- Playwright: "tap ক → spell → 2 listens → খেলি unlocks → +10 XP" + "track lesson → hint → answer → XP"
- Crowdsourced-audio slots: per-item `audioUrl?` override with TTS fallback (design only)
- PNG PWA icons (192/512 + maskable) — last installability gap

## Sprint 3 — Accounts + Parent view
- Supabase Google + phone OTP polish (guest → account merge, no XP loss)
- Neon sync: store → `User`/`Progress` tables on login (Prisma, `DATABASE_URL` in `.env`)
- Parent dashboard: per-child progress %, streak calendar, "what she learned today" (`admin_stat_panel`)
- `streakDays` actually accrues on daily visits

## Sprint 4 — Track expansion (one-track-per-tier kept)
- Math: full Class-3 addition/subtraction (20 lessons) + matching-pairs widget
- Physics: full motion chapter (velocity graphs, equations) + Chemistry: periodic-table intro
- ICT: typing + internet-safety modules; AI: "build a tiny classifier" playground (teachable-machine style, mock)
- Canonical migration: homepage speaks `EdTechContentPayload` via `toCanonicalPayload` (adapter + tests already shipped)

## Sprint 5 — Release hardening
- PWA audit close-out, bundle stays <200KB (175KB today), Edge-cache GETs, cold-start check
- Teacher review: NCTB accuracy + Islamic-content sign-off
- Release: Vercel prod, tag `mvp-v1`, demo Reel/TikTok, FUNDRAISING.md update

## Program: continuous content matrix (pre-school → high school)
| Stage | Ages | Subjects (this system) | Status |
|---|---|---|---|
| Pre-school | 2–5 | স্বরবর্ণ, ব্যঞ্জনবর্ণ (38), কার-ফলা, English A–Z, আরবি হরফ, সংখ্যা 1–20, animals, ছড়া/rhymes, tracing | ✅ Shipped (talking-book shell) |
| Pre-school+ | 3–7 | Islamic: pillars, daily duas, 15 names, 5 short surahs (parent-gated) | ✅ Starter shipped; surah library → backlog |
| Primary | 6–10 | NCTB math tracks (addition ✅ 8), Bangla/English spelling, stories | 🔄 Expanding (Sprint 4) |
| High school | 11–16 | Physics motion ✅, Chemistry atoms ✅, ICT computer ✅, AI intro ✅ | ✅ Starters; full chapters → Sprint 4+ |
| Rolling rule | — | One track per tier at a time; a new chapter needs: validated lessons + leak-free hints + tests + kid/peer review | 📏 Enforced by `validateTrack()` |

**Content policy (amended):** the old "no religion" rule now reads — *NCTB-only by default; Islamic learning lives ONLY in the parent-gated section (arithmetic gate, session-scoped unlock), never in quizzes/ads/streaks, and every item needs teacher sign-off before MVP.*

## Backlog (post-MVP, ordered)
1. Voice crowdsourcing leaderboard (native recordings replace TTS per button)
2. Full surah library + tajweed-speed toggle (gated)
3. Short-video auto-clips (letter moments → Reels/TikTok)
4. Tier 2 micro-story branches; Tier 3 mock board exams
5. Bangla↔English bridge mode for Tier 1 (phonics transfer)

## Risks
- **TTS variance** (bn-BD/ar-SA voices differ per device) → crowdsourced audio escape hatch (backlog #1)
- **Scope creep** → matrix + one-track-per-tier rule; `validateTrack()` is the CI gate
- **Free-tier limits** → mock-first engine, tiny JSON, pooled Neon URLs; monitor weekly
