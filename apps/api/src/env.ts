import * as path from 'node:path';
import { config } from 'dotenv';

/**
 * Local-dev convenience: load apps/api/.env.local then apps/api/.env.
 * Real environment values (Vercel dashboard, shell exports) always win —
 * dotenv never overrides them. Missing files are a silent no-op, so the
 * bundled Vercel function is unaffected.
 */
for (const file of ['.env.local', '.env']) {
  try {
    config({ path: path.join(__dirname, '..', file) });
  } catch {
    // ignore — e.g. file absent in serverless bundle
  }
}
