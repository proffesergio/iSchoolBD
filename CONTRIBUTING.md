# CONTRIBUTING — iSchool BD 🇧🇩

Welcome! Bangla + English both ok. Be kind to kids — no politics/religion.

## Good first issues (pick one)
- Add 1 ব্যঞ্জনবর্ণ entry (`packages/ai-engine/src/sworoborna.js` + API mirror + test)
- Record Bangla TTS sample / improve `speakBangla` voice pick
- Add Tier 2 quiz (NCTB Class 1-5, Taka/names) with test
- Cartoon CSS: new background_theme or avatar animation
- Translate docs lines to Bangla

## Workflow (Agile + TDD)
1. Branch: `feat/tier1-<letter>` / `fix/...`
2. Red: add failing test (`engine.test.js` / `app.spec.ts` / `ai-engine.test.ts`)
3. Green: minimal code to pass + schema-valid
4. Refactor + `npm run test` all workspaces
5. PR with template (tier checkbox + schema checkbox)

## Commands
```bash
npm run test --workspace=@ischool/ai-engine
npm run test --workspace=apps-api -- --runInBand
npm run test --workspace=apps-web -- --run
```

## Content rules
- Bangla-first, bite-size (<500 chars instruction)
- Must include `socratic_hint` (no direct answer)
- Validate via `validateResponse` before PR
- Use native context: Tazim/Lamia, ৳, Sundarbans, Hilsha, Jackfruit

## Fundraising transparency
Stars + shares fund voices/illustrations. See `docs/FUNDRAISING.md`. Donors listed (opt-in).
