# MEMORY — iSchool BD (for LLM tools: Cursor / Copilot / Claude / OpenCode)

Update this as code changes. Last: 2026-09-20 — MVP scaffold.

## What
Gamified Bangla-first EdTech. Monorepo: `apps/web` (Next.js PWA Tier 1 grid→fullscreen), `apps/api` (NestJS learn/progress), `packages/ai-engine` (strict JSON schema + mock + validator + token optimizer).

## Contracts (do not break)
- Schema: `packages/ai-engine/ischool.schema.json` — tiers tier_1|2|3, UI talking_letter|quiz_screen|socratic_hint|dashboard_reward, animations success_sparkle|shake_error|bounce_idle|pop_expand|confetti_burst.
- API mirrors mock in TS (`apps/api/src/learn/learn.service.ts`). Parity tests: `engine.test.js` + `app.spec.ts`.
- Frontend fallback in `apps/web/lib/ai-engine.ts` (offline PWA).

## Run
- Engine: `npm run test --workspace=@ischool/ai-engine` (zero-deps, node --test)
- API: install ws, `npm run test --workspace=apps-api -- --runInBand`, dev `:3001/api`
- Web: install ws, `npm run dev --workspace=apps-web` `:3000`

## Conventions
- Bangla-first, bite-size, positive only, NCTB + local names/currency.
- TDD red→green, schema-valid PRs, Agile sprints in `docs/AGILE.md`.

## Next
Full 39 letters, tracing, Tier 2/3 provider (Gemini free-tier + fallback), Playwright E2E, audio crowdsource.
