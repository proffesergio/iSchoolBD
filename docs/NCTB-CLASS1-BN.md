# NCTB Primary books — registry + verification program

## Registry (code: `apps/web/lib/books.ts`, Primary only)
36 books: Class 1 (4: Bangla mapped + English/MathBN/MathEN embed),
Class 2 (4: Bangla BN+EN same file + English + MathBN + MathEN),
Class 3 (16: Bangla BN+EN same + EN + Math×2 + Sci×2 + BGS×2 + 4 religions×2),
Class 4–5 (6 slots each, awaiting PDFs).
Admin uploads Drive links by book name (Admin → Books tab); uploads override
slots and light up `/books` instantly. Guides/extras also supported.

## Quota status
Drive re-downloads are rate-limited ("Quota exceeded", ~24h). Only the
Class 1 Bangla PDF is verified (below). New PDFs embed in the reader but
await readability for TOC mapping + our 4Q/chapter quiz pattern.

## Class 1 Bangla source

Source: NCTB 2023 curriculum PDF, Drive file `1hf-W5GVlAy3cHstFlozNBuE2oz7u9YXy`
(90 scanned pages, no text layer — mapped by reading page images).
Offset rule: `pdfIndex = printedPage + 8` (verified on 6 samples).

## Verified batch 1 (v2 — header + content read, quizzes live)
| পাঠ | শিরোনাম | printed | pdf | track |
|---|---|---|---|---|
| 1 | আমার পরিচয় | 1 | 9 | n1 |
| 2 | এসো রং করি ও আঁকি | 2 | 10 | n2 |
| 3 | আমি ও আমার বিদ্যালয় | 3 | 11 | n3 |
| 4 | আমি ও আমার সহপাঠীরা | 4 | 12 | n4 |
| 5 | আঁকাআঁকি | 6 | 14 | n5 |
| 6 | আমরা কী কী করি | 8 | 16 | n6 |
| 7 | আঁকাআঁকি | 9 | 17 | n9 |
| 8 | ছড়া (তোতা পাখি) | 11 | 19 | n7 |
| 9 | বাঘ ও রাখাল | 12–13 | 20–21 | n8 |
| 16 | স্বরবর্ণ | 22 | 30 | — |
| 39 | ব্যঞ্জনবর্ণ | 55 | 63 | — |

## TOC transcription (v0 — titles from সূচিপত্র, pages/quizzes queued)
Uncertain readings to re-verify: #7 title, #17 title, #45 page.
Full list lives in code: `apps/web/lib/nctb-class1-bn.ts` (54 পাঠ).

## Reader
`/books` → `/books/nctb-1-bn`: Drive preview embed + পাঠ index (✅/⏳) +
অনুশীলন overlay (track `nctb-1-bn-path`, 9 lessons, no-leak validated).
English book (`nctb-1-en`) lands after Bangla পাঠ 1–20 stabilize.

## Next batches
- Batch 2: পাঠ 10–20 (verify pages, quizzes, link track n10+).
- Batch 3: পাঠ 21–38 (বর্ণ/কার) + tracing activities.
- Batch 4: পাঠ 39–54 (stories) + moral quizzes.
