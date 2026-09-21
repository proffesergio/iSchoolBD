# Local Run & Test — iSchool BD

> Just want it running? Open **two terminals** in the repo root and paste one line in each. No `.env`, no Prisma, no keys needed.
>
> ```powershell
> # Terminal 1 — backend (NestJS → http://localhost:3001/api/health)
> $env:NODE_ENV="development"; npm run backend
>
> # Terminal 2 — frontend (Next.js PWA → http://localhost:3000)
> $env:NODE_ENV="development"; npm run frontend
> ```
>
> Then open `http://localhost:3000`, click a letter (try ক → কাক 🐦‍⬛), hear 🔊 TTS, earn XP. Done.
> Ports are pinned in the scripts (`cross-env PORT=...`), so a stray system `PORT` can't move them.

Monorepo: `apps/web` (Next.js 14 PWA, :3000) + `apps/api` (NestJS, :3001) + `packages/ai-engine` (zero-dep JSON contract).

## 1. Prerequisites

- Node 20 (`nvm use 20` — see `.nvmrc`), npm 10+
- PowerShell (commands below are `pwsh`-safe; run from repo root)
- Optional: Neon CLI (`npm i -g neon@latest`) + Supabase project (only for Google/phone login)

> Windows gotcha: this machine has `NODE_ENV=production` + `npm omit=dev`, which prunes devDependencies
> (vitest, tailwind, `@types/*`). Always install/run with dev included:
> `$env:NODE_ENV="development"; npm install --include=dev --no-audit --no-fund`

## 2. Install

```powershell
$env:NODE_ENV="development"
npm install --include=dev --no-audit --no-fund
```

Expected: engine 0 extra deps, web + api install clean. If `tailwindcss`/`vitest` resolve errors appear, re-run the command above.

## 3. Env setup (all optional for happy path — fallbacks exist)

| File | Source | Purpose |
|---|---|---|
| `.env.local` (root) | `neon link --project-id falling-grass-46640693 --branch production -y` | `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH` (already pulled) |
| `apps/web/.env.local` | copy from `apps/web/.env.example` | `NEXT_PUBLIC_API_BASE=http://localhost:3001/api`; Supabase keys only needed for login button (guest mode works without) |
| `apps/api/.env` | copy from `apps/api/.env.example` | `PORT=3001`, `WEB_ORIGIN=http://localhost:3000`; Supabase keys optional (progress uses in-memory fallback) |
| `.env` (root) | copy `DATABASE_URL` from `.env.local` | Prisma CLI reads `.env`, not `.env.local` — needed only for `prisma db push` |

```powershell
Copy-Item apps\web\.env.example apps\web\.env.local
Copy-Item apps\api\.env.example apps\api\.env
```

> ⏭️ Skip this whole section on first run — everything has a fallback (guest mode, mock engine, in-memory progress). Come back only if you need login, Neon, or Prisma.

## 4. Run locally (2 terminals — same as top)

```powershell
# Terminal 1 — backend
$env:NODE_ENV="development"; npm run backend   # = cross-env PORT=3001 → apps/api, :3001/api

# Terminal 2 — frontend
$env:NODE_ENV="development"; npm run frontend  # = cross-env PORT=3000 → apps/web, :3000
```

(`npm run dev:api` / `npm run dev:web` are the underlying scripts — `backend`/`frontend` just pin the ports.)

Smoke checks:
- `http://localhost:3001/api/health` → `{"status":"ok"}`
- `http://localhost:3001/api/learn/talking-letter/ক` → strict `talking_letter` JSON (ক → কাক 🐦‍⬛)
- `http://localhost:3000` → স্বরবর্ণ grid → click a letter → fullscreen + 🔊 TTS + XP bar
- New Zod Edge route (no backend needed): `POST http://localhost:3000/api/ai/generate`
  `{"tier":"tier_2","academicTopic":"nctb_math_class3_addition","progressPercentage":20}` → `gamified_quiz` with ৳ context

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/ai/generate -Method Post `
  -ContentType "application/json" `
  -Body '{"tier":"tier_2","academicTopic":"nctb_math_class3_addition","progressPercentage":20}' |
  ConvertTo-Json -Depth 8
```

Docker alternative: `docker-compose up --build` (web :3000, api :3001).

<details>
<summary><b>Optional: Prisma → Neon (only when you need a real database)</b></summary>

Ignore this until login-persistence or progress-history across restarts matters. The API runs fine on an in-memory store.

```powershell
npx prisma validate --schema prisma\schema.prisma
# Prisma CLI reads root .env (not .env.local): copy the DATABASE_URL line from .env.local to .env (both gitignored)
npx prisma db push --schema prisma\schema.prisma
```

</details>

## 5. Test (verified 2026-09-20: engine 7/7, web 2/2, api 5/5)

```powershell
$env:NODE_ENV="development"
npm run test:engine                                        # node --test, validator + mock Tier 1/2/3 + token budget
npm run test --workspace=apps-web                         # vitest: addXp, progressAfter
npm run test --workspace=apps-api -- --runInBand          # jest+supertest: health, letters, talking-letter 200/404, progress round-trip
npm run validate:schema                                   # engine example vs ischool.schema.json
npx tsc --noEmit -p apps\web\tsconfig.json               # web strict typecheck (root has no tsconfig.json — check per-workspace)
```

What each suite guards:
- `packages/ai-engine`: `talking_letter` for ক valid, unknown letter throws, Tier 2 has ৳/names, Tier 3 hint never reveals answer, oversized `instruction_text` (>500 chars) rejected
- `apps/web`: offline `fallbackPayload` works when API down; XP math `addXp`/`progressAfter`
- `apps/api`: strict contract passthrough, `Ω → 404` with letter list, progress upsert without Supabase

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module 'tailwindcss'/'vitest'/'zod'` | Re-run install with `$env:NODE_ENV="development"` + `--include=dev` |
| Web shows guest mode / login alert | Normal without Supabase keys; PWA + mock engine still fully work offline |
| `POST /api/progress` 400 | Send `{user_id, topic, xp, progress_percentage}` (see `docs/API.md`) |
| `Ω` letter 404 | Expected — MVP letters only: অ-ঔ + ক খ গ ঘ; response lists valid letters |
| Port already in use :3000/:3001 | Scripts pin ports via `cross-env`; if something else holds them: `Get-NetTCPConnection -LocalPort 3000,3001 \| Select-Object OwningProcess`, stop it, retry |
| `neon ... invalid_grant` | `neon auth` in your own terminal (browser), then retry `neon link` |
