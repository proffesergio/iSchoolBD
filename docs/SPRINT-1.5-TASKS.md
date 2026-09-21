# Sprint 1.5 — Control plane (REQUIRED before Sprint 2)

Status: **built, 15 API + 44 web tests green**. Admin: follow `docs/ADMIN.md`.

## Backend tasks
- [x] `CatalogService`: courses/chapters/lessons + video courses/sections/lectures store
- [x] Public reads: `GET /api/catalog/courses`, `/courses/:id`, `/video-courses`, `/video-courses/:id`
- [x] `AdminGuard` (`x-admin-key` === `ADMIN_API_KEY`, fail-closed)
- [x] Admin writes: lessons/courses/chapters/video-courses/lectures upsert + deletes
- [x] `GET /api/admin/students` (every login = Student row) + `GET /api/admin/stats`
- [x] `GET /api/progress/summary?user_id=` rollup (+ `all()` for aggregation)
- [x] 8 new e2e tests (`catalog-admin.spec.ts`); CI `feature-admin` job
- [ ] Set `ADMIN_API_KEY` on Vercel API project + redeploy (human, 5 min)
- [ ] Create Supabase `progress` table (SQL in ADMIN.md) so data survives redeploys

## Frontend tasks
- [x] `lib/admin-client.ts` (typed admin + public API client)
- [x] `lib/analytics.ts` (levels, streaks, weekly bars, topic split) + 5 tests
- [x] `/admin` panel: key gate, lessons CRUD, paste-link video add, students table, stats cards
- [x] `/dashboard` student analytics: XP ring, level, streak, 7-day bars, topics, continue links
- [x] Profile links to `/dashboard` + `/admin`; admin/dashboard CSS + animations
- [ ] Phone QA: panel on mobile, dashboard ring/bars, dark theme (human)

## Handoff to Sprint 2 (new pattern)
- [x] `scripts/seed-sprint2-class1.mjs` — content via admin API, not code edits
- [ ] Run the seed script against production API, verify catalog reads
- [ ] Sprint 2 then proceeds: Class-1 full coverage in weekly content batches
      through the panel/script, storefront migrates to backend-first in Sprint 5
