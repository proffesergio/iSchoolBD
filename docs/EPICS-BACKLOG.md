# Program Backlog — iSchool EdTech (ages 6–16, Bangladesh)

Working agreement: 2-week sprints. Every story ships as
1) user story + Gherkin acceptance criteria,
2) architecture/schema/API deltas,
3) UI/UX spec + code,
4) edge cases + Bangladeshi context (3G drops, SMS failures, MFS redirects).
Stack reality today: Next.js App Router + Tailwind, NestJS API, Supabase
(progress/profiles), in-memory fallbacks. Prisma/Postgres, Redis, Shadcn,
Framer Motion, MFS (bKash/Nagad/Rocket), OTP (BulkSMSBD/Greenweb) land
incrementally inside the epics below — no big-bang rewrites.

## UI direction (applies to all epics)
- New generic design system site-wide: clean surfaces, Poppins + SolaimanLipi/
  Kalpurush type scale, Lucide-style icon-first navigation, rounded-2xl cards.
- Play stays where learning needs it: early-learning player keeps celebratory
  feedback; chrome, catalog, dashboards go generic-professional.
- Budgets (low-bandwidth): lazy routes, compressed assets, skeleton loaders,
  efficient DOM; every video epic task carries a 3G acceptance test.

## Epic 1 — Onboarding, Security & Auth (Sprint A)
Stories:
1. `AUTH-1` Parent signup via BD phone + OTP (BulkSMSBD/Greenweb, resend
   backoff, Bengali SMS template).
   - Given a parent enters an 01XXXXXXXXX number, When they request OTP,
     Then a 6-digit code arrives ≤60s and 3 wrong tries lock 5 min.
2. `AUTH-2` Google OAuth alongside OTP (existing Supabase flow kept).
3. `AUTH-3` Master parent account spawns student sub-profiles (avatar, age
   band, class) — CRUD in `/admin` + parent dashboard switcher.
4. `AUTH-4` Guardian PIN-lock gate between kid zone and billing/settings
   (math-question fallback offline, like current ParentGate).
Tasks: OTP provider adapter + failover (2), rate-limit + audit log (2),
sub-profile schema/API/UI (6), PIN-lock component + e2e (3), Bengali i18n
pass (2), 3G + SMS-failure drills (2). ≈ 17 tasks.

## Epic 2 — Discovery & Localized Checkout (Sprint B)
Stories:
1. `CAT-1` Udemy-style catalog grid: categories (NCTB, Coding & STEM, Arts,
   Language), search, filters, skeleton cards.
2. `CAT-2` Coursera-style course page: collapsible modules, outcomes,
   teacher reel, reviews.
3. `PAY-1` MFS checkout (bKash/Nagad/Rocket sandbox → prod): idempotent
   orders, webhook reconcile, zero-drop retry, receipts in Bangla.
Tasks: catalog API + indexes (4), course page + reviews (6), MFS adapter +
sandbox harness (6), webhook/idempotency (3), refund/failed-payment UX (2),
low-bandwidth listing budget (2). ≈ 23 tasks.

## Epic 3 — Learning Engine (Sprint C)
Stories:
1. `VID-1` Adaptive player: HLS/DASH where available, multi-speed, resume,
   offline downloads (PWA cache), graceful 3G degradation.
2. `VID-2` Micro-assessments: in-video MCQ check-ins, matching games,
   milestone assignments writing to progress API.
3. `VID-3` Instant feedback: confetti, streak sounds, XP toasts (reduced-motion
   respected).
Tasks: player rebuild on existing CoursePlayer (5), offline pack (3),
assessment engine + API (6), feedback kit (3), network-chaos tests (2). ≈ 19 tasks.

## Epic 4 — Gamification & Parent Metrics (Sprint D)
Stories:
1. `GAM-1` Streaks, XP levels (extends current 100-XP levels), trophy cabinet.
2. `GAM-2` Regional weekly leaderboards (cohort-safe, opt-in, Redis sorted sets).
3. `PAR-1` Parent analytics portal: time-on-app bars, subject heatmaps, skill
   gaps (extends current /dashboard + admin stats).
Tasks: trophy schema/UI (4), leaderboard service + moderation (5), parent
portal charts (5), weekly digest (2), privacy review (2). ≈ 18 tasks.

## Cross-cutting (every sprint)
- i18n keys for new strings, a11y tap targets ≥44px, per-feature CI jobs,
  Vercel preview QA on real phones, ADMIN.md updates.
- Task scale: ~77 story tasks + content tasks (ROADMAP 1,400+) across Sprints A–D.
