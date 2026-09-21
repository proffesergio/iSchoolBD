# 🌟 iSchool BD — Free Forever Gamified Learning for Bangladesh

> **Bangla-first • NCTB-aligned • PWA • Cartoon motion • Duolingo-style

[![CI](https://github.com/your-org/ischool-bd/actions/workflows/ci/badge.svg)](https://github.com/your-org/ischool-bd/actions/workflows/ci)
![License: MIT](https://img.shields.io/badge/License-MIT-green)
![Bangla First](https://img.shields.io/badge/Language-বাংলা-red)
![Free Forever](https://img.shields.io/badge/Free-Forever-brightgreen)
![PWA](https://img.shields.io/badge/PWA-ready-blueviolet)

**Live demo:** `apps/web` → 📚 bookshelf (9 talking pages + 5 study tracks) → tap a button → hear it → unlock ❓ quiz → earn XP
- 🎈 **Tier 1 (2–5):** Talking Book — `ক` first only says “ক!”, then কাক 🐦‍⬛, then quiz; English A–Z, আরবি, সংখ্যা, ছড়া, tracing
- 📚 **Tier 2 (1–5):** Class-3 addition track (তাজিম, লামিয়া, ৳) with Apu hints
- 🚀 **Tier 3 (6–10):** Physics, Chemistry, ICT + AI-intro tracks, Socratic hints, Banglish coach

```json
{
  "module_metadata": { "tier": "tier_1", "topic": "sworoborna_ক", "progress_percentage": 10 },
  "ui_component": { "type": "talking_letter" },
  "content": { "instruction_text": "ক চাপ দাও! কাক দেখো 🐦‍⬛" },
  "gamification": { "xp_reward": 10, "feedback_message": { "on_success": "শাবাশ! 🎉" } }
}
```
Full contract: `packages/ai-engine/ischool.schema.json`

## ✨ Why star this?
- 🇧🇩 Built for Bangladeshi kids — Sundarbans, Hilsha, Jackfruit, Shahid Minar
- 📱 Installable PWA + mobile wrapper-ready, offline fallback, Bangla TTS
- 🤖 Strict JSON AI Engine — works on **free-tier Gemini/OpenAI**, token-optimized, validated
- 🌱 **Free Forever Learning** — no paywall for core NCTB content
- 🤝 Good-first-issues, Bangla + English docs, voice-crowdsourcing

## 🚀 Quickstart (2 terminals, 2 min)

```powershell
$env:NODE_ENV="development"
npm install --include=dev --no-audit --no-fund

# Terminal 1 — backend (NestJS → http://localhost:3001/api/health)
$env:NODE_ENV="development"; npm run backend

# Terminal 2 — frontend (Next.js talking-book PWA → http://localhost:3000)
$env:NODE_ENV="development"; npm run frontend
```

No `.env`, no keys needed — guest mode + mock engine + in-memory progress. Details: `docs/LOCAL_SETUP.md`.

```powershell
# Tests (all green)
npm run test:engine                                  # 7/7 validator + mock tiers
npm run test --workspace=apps-web                    # 27/27 shelf, tracks, store, trace
npm run test --workspace=apps-api -- --runInBand     # 5/5 health, letters, progress
```

Supabase SQL: run `supabase/schema.sql` (profiles + progress + RLS).

## 🗂️ Monorepo

```
apps/web        Next.js 14 PWA — cartoon grid + fullscreen talking letter + XP meter
apps/api        NestJS — /api/learn/* (AI proxy) + /api/progress (Supabase) + /api/health
packages/ai-engine  Strict JSON schema + validator + token optimizer + mock Tier 1/2/3
supabase/schema.sql  Auth + profiles + progress tables
memory/         LLM context files (for Cursor / Copilot / Claude / other tools)
docs/           AGILE, API, CROWDSOURCE, FUNDRAISING
```

## 🎮 Gamification
XP + streak multiplier + `success_sparkle` / `shake_error` / `bounce_idle` / `confetti_burst`. Every concept = bite-size node. Instant “শাবাশ!” feedback.

## 🛡️ Safety
No politics / religion. Positive reinforcement only. NCTB accuracy. See `ARCHITECTURE.md`.

## 🤝 Contribute (Stars → Funds → Features)
1. Read `CONTRIBUTING.md` + `docs/AGILE.md`
2. Pick `good first issue` — add a letter, voice, or quiz
3. PR must pass schema validator + tests
4. Star ⭐ + share demo Reels/TikTok → helps us raise via GitHub Sponsors / Open Collective / bKash-Nagad transparency (`docs/FUNDRAISING.md`)

## 🗺️ Roadmap
- [x] MVP: Tier 1 Sworoborna grid + TTS + XP (this repo)
- [ ] Full 39 ব্যঞ্জনবর্ণ + tracing/canvas
- [ ] Tier 2 matching + Tier 3 mock engine + provider router (Gemini free-tier)
- [ ] Short-video auto-clips + voice crowdsourcing leaderboard

MIT — Made with 💚 in Bangladesh.
