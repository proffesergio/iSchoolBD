# API — iSchool BD

Base: `http://localhost:3001/api`

- `GET /health` → `{status:'ok'}`
- `GET /learn/letters` → `{letters:['অ','আ',...]}`
- `GET /learn/talking-letter/:letter?progress=10` → strict engine JSON (`talking_letter`)
- `GET /learn/quiz/tier2` → `quiz_screen` (Taka context)
- `GET /learn/socratic/tier3` → `socratic_hint`
- `GET /progress?user_id=` → list
- `POST /progress {user_id, topic, xp, progress_percentage}` → upsert

All learn responses validate against `packages/ai-engine/ischool.schema.json`.
Errors: `404 {message, letters}` for unknown letter; `400` for missing user_id.
