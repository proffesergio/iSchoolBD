# ARCHITECTURE — iSchool BD

Stateless **Core AI Engine** → validated JSON → decoupled frontends (PWA + mobile wrapper) + Admin suite.

```
[ Kid PWA (Next.js) ] <-- strict JSON --> [ API (NestJS) ] <-- prompt --> [ Provider: mock | Gemini | OpenAI ]
        |                                            |
   Supabase Auth (Google/phone)              Supabase Postgres (profiles, progress)
   speechSynthesis bn-BD TTS                 validator.js gate (reject invalid before send)
```

## Contracts
- Single source: `packages/ai-engine/ischool.schema.json` (draft 2020-12).
- Validators: JS (`packages/ai-engine/src/validator.js`) + TS mirror in API (`learn.service.ts`).
- Token budget: instruction_text ≤500 chars, `estimateTokens ≈ len/3`, `buildEfficientPrompt` keeps system prompt tiny.

## Tiers
- **tier_1:** `talking_letter`, phonetic_matching, bounce_idle, joyful Bangla.
- **tier_2:** `quiz_screen`, Apu/Bhaiya tone, Taka/names/landmarks.
- **tier_3:** `socratic_hint`, Banglish coach, hints never reveal answer.

## Frontend motion (learn-first: শোনো → শব্দ → খেলা)
Single-page grid (all letters visible) → `pop_expand` fullscreen → giant letter + spell-ONLY TTS (slow, `ক!`) → replay builds listens → after 2 listens word card (🐦‍⬛ কাক) + quiz unlock → `success_sparkle`/`shake_error` → XP bar + confetti. Quiz never shows before the sound is learned. Installable PWA (`manifest.json` + `sw.js`), offline fallback payloads.

## Backend
- `GET /api/health`, `GET /api/learn/letters`, `GET /api/learn/talking-letter/:letter`, `GET /api/learn/quiz/tier2`, `GET /api/learn/socratic/tier3`
- `GET/POST /api/progress` (Supabase upsert, in-memory fallback for dev/test).
- Helmet, ValidationPipe, CORS by `WEB_ORIGIN`.

## Safety / NCTB
Minor-safety filter: reject politics/sensitive content; NCTB topics only by default.
Exception: the parent-gated Islamic section (arithmetic gate, session unlock) holds
pillars/duas/surahs/names — opt-in, never in quizzes or streaks, teacher-signed.
Positive reinforcement only.

## Free-tier strategy
Mock engine default (zero cost). Provider router later with quota fallback → mock. Edge-cacheable GETs, tiny JSON, Supabase free tier.
