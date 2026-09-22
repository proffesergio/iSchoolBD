# Sprint A — Epic 3.1: Adaptive Player GA (DONE)

Verified: 23/23 API + 64/64 web tests, both builds green.

## 1. User stories & acceptance criteria

**VID-1 — As a student on 3G, I want videos that resume, adapt and play
offline, so that drops never lose my place.**
- Given a direct mp4 lecture, When I leave mid-way and return, Then playback
  resumes with a "Resumed m:ss" toast (position persisted locally).
- Given an `.m3u8` URL, When the player loads, Then Safari plays natively and
  other browsers lazy-load hls.js (no upfront bundle cost).
- Given a downloaded lecture and no network, When I open it, Then the cached
  blob replays with an "Offline replay" badge; YouTube/Drive/Terabox-share
  honestly report unavailability.
- Given a stall >1.5s, When buffering, Then a "Slow connection" note shows
  until playback resumes; failures show retry.

**VID-2 — As a teacher, I want in-video check-ins, so that watching becomes
active learning.**
- Given checkpoints `[{atSec, prompt, choices[2-4], correct, xp}]` on a
  lecture, When playback crosses `atSec`, Then video pauses and an MCQ overlay
  appears; correct → XP + progress POST `video:{course}:{lecture}`; wrong →
  retry or skip.
- Given an iframe embed (no time tracking), When it has checkpoints, Then they
  render as inline check-in cards under the stage.
- Given invalid JSON in the admin editor, When saving, Then field-level errors
  block the save (client + server validation).

**VID-3 — As a kid, I want instant celebration, so that I keep going.**
- Given a correct check-in, When answered, Then confetti bursts, "+XP" toast
  floats, melody plays (mutable via 🔔); reduced-motion shows toast only.

## 2. Architecture & schema

- Client: `CoursePlayer` state machine (stage/transport/playlist) +
  `offline-videos.ts` (Cache API), `device.ts` (guest id), `melody.ts`
  (WebAudio), `Confetti`/`XpToasts`, HLS effect (dynamic `import("hls.js")`).
- Server: `LectureRecord.checkpoints?: Checkpoint[]` (validated ≤10, choices
  2–4, xp 0–500, sorted by atSec); progress rows keyed
  `video:{courseId}:{lectureId}` flow into existing Students/Stats aggregation.
- Future Supabase DDL (no migration needed while memory-first):
  ```sql
  alter table if exists lectures add column if not exists checkpoints jsonb default '[]';
  ```

## 3. UI spec & code

- `components/video/CoursePlayer.tsx` (rewrite): overlays (checkpoint card,
  net-note, offline badge), transport (+⬇️ download, 🔔 sound, rate, fullscreen),
  playlist with ✋ checkpoint markers and ✅ completion.
- `components/feedback/{Confetti,XpToast}.tsx`, `lib/{melody,offline-videos,device}.ts`.
- Admin Videos tab: per-lecture Check-ins editor (JSON + validate + save).

## 4. Edge cases — Bangladeshi context

- 3G stall mid-lesson → note + resume, never a dead player; retry button on error.
- Drive `uc?export=download` without CORS → download reports failure, stream continues.
- Terabox share links → external-open + manual completion (no fake inline player).
- Private-mode browsers → all storage guarded, features degrade to session-only.
- Shared family phones → per-device ids keep guest stats honest; login merges identity.
- Reduced motion → confetti off, toasts persist; sounds mutable, never autoplay.
