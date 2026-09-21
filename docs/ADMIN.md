# Admin Guide — managing everything on iSchool

The admin panel (`/admin` on the website) controls the whole frontend catalog:
lessons, chapters, courses, video playlists/lectures, students and stats.
Content flows **backend → storefront** (new system pattern): edits you save hit
`GET /api/catalog/*`, which the site reads. No code deploys needed for content.

## 1. One-time setup (5 min)

1. **Create the key** (PowerShell):
   `-join ((48..122) | Get-Random -Count 48 | % {[char]$_})`
   Copy the output — this is your `ADMIN_API_KEY`.
2. **Local**: add to `apps/api/.env.local` (that exact file — the API one,
   not the web one), one line, no quotes even if it contains `` ` `` `\` `?`:
   `ADMIN_API_KEY=<paste>`
   The API loads this file automatically (dotenv is bundled). **Restart the
   API** after editing (`npm run dev:api`) — running servers never pick up
   file changes.
3. **Production (Vercel)**: API project → Settings → Environment Variables →
   add `ADMIN_API_KEY` (all environments) → Redeploy.
4. **Supabase (recommended for real data)**: without `SUPABASE_URL` /
   `SUPABASE_ANON_KEY` the API stores catalog + progress **in memory**
   (resets on redeploy). With them, progress persists in the `progress` table.
   Run this SQL once in Supabase:
   ```sql
   create table if not exists progress (
     user_id text not null, topic text not null,
     xp int not null default 0, progress_percentage int not null default 0,
     streak_days int not null default 1, updated_at timestamptz default now(),
     primary key (user_id, topic)
   );
   ```

## 2. Opening the panel

1. Go to `https://<your-web-url>/admin` (or Profile → 🛠️ অ্যাডমিন).
2. Paste `ADMIN_API_KEY` → Unlock. The key lives in **sessionStorage only**
   (this browser tab) — never in code, never in git.
3. Wrong key / missing env → `403` with a setup hint. That is fail-closed by design.

## 3. Managing lessons (📝 পাঠ tab)

- **New course / chapter first**: the Lessons tab has creation cards — course
  needs id (`c4-math`), class, subject and both titles; chapter needs id and
  titles inside the selected course. Same pattern for video: the Videos tab
  has a **new video course** card, plus per-course **section manager**
  (add, rename inline, delete with lecture cascade).
- Pick **course → chapter** from the dropdowns, then add/edit lessons as before
  (kind, refId, XP, 🎙️ voice-over URL + text).
- The lecture form targets a section dropdown or **＋ Auto-new section**.
- Lessons: id (`c1-ma-co-9` style, unique), both titles, kind
  (`interactive`/`video`/`quiz`), optional `refId`, XP 0–500 → Save (upsert by
  id); Edit loads a row into the form; delete asks for confirm and never
  touches student progress rows.

## 4. Managing video courses (🎬 ভিডিও tab)

- **New course first**: courses are created via API (panel lists existing):
  `PUT /api/admin/video-courses` with `{id, titleBn, titleEn, classId?, subject?}`.
- **Add lecture**: paste any YouTube / Drive / Terabox / mp4 link + title → Add.
  The panel auto-detects the provider and files the lecture into a new section
  (auto-numbered `Section N`, Udemy-style). Terabox without a resolved file URL
  plays via external-open + manual completion — attach `directUrl` later if you get one.
- **Delete**: 🗑️ per lecture.

## 5. Students & stats (🧑‍🎓 / 📊 tabs)

- **Every logged-in user is a Student**: one row per `user_id` (email/phone from
  Supabase Auth), aggregated XP, topics, streak, last active.
- **Stats**: student count, progress events, total XP, catalog counts, top-10 topics.
- Guest (logged-out) learning stays on-device and does **not** appear here.

## 6. Sprint 2 content seeding (scripted, no clicking)

`scripts/seed-sprint2-class1.mjs` pushes the first Class-1 batch (3 chapters,
9 lessons) through the admin API — the pattern for all future content drops:
```powershell
$env:ADMIN_API_KEY="<key>"
$env:API_BASE="https://<api-url>/api"   # or http://localhost:3001/api
node scripts/seed-sprint2-class1.mjs
```
Verify: `GET /api/catalog/courses/c1-math` shows the new chapter.

## 7. Security & troubleshooting

- Rotate the key anytime: change env → redeploy → old sessions fail closed.
- Never expose the key as `NEXT_PUBLIC_*`. The web app only ever sends it as
  `x-admin-key` from your browser tab.
- Catalog edits are instant (no rebuild); web **static seeds** in
  `apps/web/lib/*` remain as offline fallback until Sprint 5 migrates the
  storefront to backend-first reads.

### Admin login doesn't work? Check in this order
1. **The unlock screen shows the API base + status.** If it says
   `❌ পৌঁছানো যাচ্ছে না` with `http://localhost:3001/api`, your web project
   is missing `NEXT_PUBLIC_API_BASE` → Vercel **web** project → Settings →
   Environment Variables → `NEXT_PUBLIC_API_BASE=https://<api-url>/api`
   (all environments) → **Redeploy** the web project.
2. **`ভুল কী`** → the key in your browser doesn't match the **API** project's
   `ADMIN_API_KEY`. Copy-paste exactly (no extra spaces) — special characters
   like `` ` `` `\` `?` are fine but must match byte-for-byte.
3. **`Admin is disabled`** → `ADMIN_API_KEY` isn't set on the **API** project
   (not the web project!) → add it → **Redeploy the API project**.
   Env changes NEVER apply without a redeploy.
4. **Key is set + redeployed + still 403?** → you may be hitting an old
   deployment: Vercel Deployments tab → latest has your env → clear browser
   cache / try incognito.
5. **CORS errors in console?** → API project's `WEB_ORIGIN` must include your
   web URL (`https://<web-url>`) or `*`, then redeploy API.

### `Cannot find module './236.js'` (stale chunks)
Not a code bug — the browser/CDN cached a page whose JS chunks were replaced
by a newer build (no dynamic imports exist in the codebase). Fix:
1. Vercel → Deployments → **Redeploy** the web project (clears the edge cache).
2. Hard-refresh the page (Ctrl+Shift+R / Cmd+Shift+R) or incognito.
3. Locally: delete `apps/web/.next` and rebuild. Verified remedy: fresh
   production build serves all routes 200 with every referenced chunk present.

## 8. Student login (ID + PIN roster)

1. **API project env**: `STUDENT_ACCOUNTS=rahim-01:1234,mina-02:5678`
   (id:pin pairs, ids lowercase ≥3 chars, PINs ≥4 chars) → redeploy API.
   Optional: `STUDENT_TOKEN_SECRET` (else falls back to `ADMIN_API_KEY`).
   Local: same keys in `apps/api/.env.local`.
2. Students open `/login`, enter ID + PIN. **First login → profile creation**
   (name, class preschool–class-5, avatar) — required to continue.
3. Every login counts as a **Student** in `/admin` → Students tab (by student ID),
   and `/dashboard` shows their analytics.
4. Supabase `student_profiles` table (optional, for persistence across redeploys):
   ```sql
   create table if not exists student_profiles (
     user_id text primary key, name text not null, class_id text not null,
     avatar text not null default '🦊', created_at timestamptz default now(),
     updated_at timestamptz default now()
   );
   ```

## 9. Manual voice-overs (pre–class 2)

- TTS autoplay exists **only** for preschool–class 2 materials (policy:
  `apps/web/lib/tts-policy.ts`). Class 3+ is visual + tap-to-hear 🔊 buttons.
- In `/admin` → Lessons tab, each lesson has **🎙️ voice-over audio URL + text**.
  Upload the mp3 anywhere (Drive direct link, CDN, Supabase Storage) and paste
  the URL; the lesson row gets a preview player. The `VoiceButton` component
  (`components/ui/VoiceButton.tsx`) plays this file in child materials,
  falling back to synthesis only where the policy allows.
