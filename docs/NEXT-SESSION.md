# Next-session queue (course system live)

## Just shipped (verify on deploy)
- Class 1–3 course tree: `/courses` → class → books → chapters → quizzes
- 80-question bank (20 chapters × 4), practice + 30s/question exam mode
- Device-first chapter progress + backend sync (`chapter:{id}` topics)
- Badges (6), daily mission, weekly leaderboard (`/leaderboard`, class tabs)
- Backend: science seeds, `classOfChapter`, `/api/leaderboard`
- Webpack note: `..` climbs out of `[...]` route dirs fail to resolve on this
  setup — always use `@/` alias imports inside dynamic route files.

## Next session, in order
1. ~~NCTB পাঠ 1–10~~ DONE (plus 16/39 spots) — next: batch 2 (পাঠ 10–20).
2. ~~`/books` PDF reader~~ DONE (36-book registry, class 1–5, admin uploads).
3. **When new PDFs arrive (you paste links / quota clears)**: verify TOC →
   chapter map → our 4Q/chapter quiz pattern per book (English/Math first).
4. Class 4–5 quiz content after their books verify.
5. Epic 1.1 OTP login path (BulkSMSBD/Greenweb adapter).
6. 3G chaos drills + full a11y audit.
