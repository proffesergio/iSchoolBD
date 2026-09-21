import { Injectable, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { createHmac, timingSafeEqual, createHash } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';

export interface StudentProfile {
  studentId: string;
  name: string;
  classId: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

const ID_RE = /^[a-z0-9][a-z0-9-]{2,40}$/;
const CLASS_RE = /^(preschool|class-[1-5])$/;

/**
 * Easy student login for launch: ID + PIN roster from env, HMAC tokens.
 * No passwords stored — only compare hashes of the PIN from env.
 * Profiles persist to Supabase `student_profiles` when configured,
 * otherwise in memory (documented in docs/ADMIN.md).
 */
@Injectable()
export class StudentAuthService {
  private memProfiles = new Map<string, StudentProfile>();

  constructor(private readonly sb: SupabaseService) {}

  /** STUDENT_ACCOUNTS="rahim-01:1234,mina-02:5678" */
  private roster(): Map<string, string> {
    const raw = process.env.STUDENT_ACCOUNTS ?? '';
    const map = new Map<string, string>();
    for (const pair of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
      const idx = pair.indexOf(':');
      if (idx <= 0) continue;
      const id = pair.slice(0, idx).trim().toLowerCase();
      const pin = pair.slice(idx + 1).trim();
      if (ID_RE.test(id) && pin.length >= 4) map.set(id, pin);
    }
    return map;
  }

  rosterConfigured(): boolean {
    return this.roster().size > 0;
  }

  private secret(): string {
    return process.env.STUDENT_TOKEN_SECRET || process.env.ADMIN_API_KEY || 'dev-only-secret';
  }

  private hashPin(pin: string): Buffer {
    return createHash('sha256').update(`pin:${pin}`).digest();
  }

  verifyPin(studentId: string, pin: string): boolean {
    const expected = this.roster().get(studentId.toLowerCase());
    if (!expected) return false;
    const a = this.hashPin(pin);
    const b = this.hashPin(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  issueToken(studentId: string): string {
    const id = studentId.toLowerCase();
    const issuedAt = Date.now().toString(36);
    const sig = createHmac('sha256', this.secret()).update(`${id}.${issuedAt}`).digest('base64url');
    return `${id}.${issuedAt}.${sig}`;
  }

  verifyToken(token: string): string | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [id, issuedAt, sig] = parts;
    if (!ID_RE.test(id)) return null;
    const want = createHmac('sha256', this.secret()).update(`${id}.${issuedAt}`).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(want);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (!this.roster().has(id)) return null;
    return id;
  }

  async getProfile(studentId: string): Promise<StudentProfile | null> {
    const mem = this.memProfiles.get(studentId);
    if (mem) return mem;
    try {
      const client = this.sb.client();
      if (!client) return null;
      const { data, error } = await client.from('student_profiles').select('*').eq('user_id', studentId).single();
      if (error || !data) return null;
      const row = data as { user_id: string; name: string; class_id: string; avatar: string; created_at: string; updated_at: string };
      return {
        studentId: row.user_id, name: row.name, classId: row.class_id,
        avatar: row.avatar, createdAt: row.created_at, updatedAt: row.updated_at,
      };
    } catch {
      return null;
    }
  }

  async saveProfile(studentId: string, input: { name: string; classId: string; avatar?: string }): Promise<StudentProfile> {
    const name = input.name.trim();
    if (name.length < 1 || name.length > 60) throw new UnauthorizedException('Name must be 1-60 characters.');
    if (!CLASS_RE.test(input.classId)) throw new UnauthorizedException('classId must be preschool or class-1..class-5.');
    const avatar = (input.avatar ?? '🦊').slice(0, 8);
    const now = new Date().toISOString();
    const prev = await this.getProfile(studentId);
    const profile: StudentProfile = {
      studentId, name, classId: input.classId, avatar,
      createdAt: prev?.createdAt ?? now, updatedAt: now,
    };
    this.memProfiles.set(studentId, profile);
    try {
      const client = this.sb.client();
      if (client) {
        const { error } = await client.from('student_profiles').upsert({
          user_id: studentId, name, class_id: input.classId, avatar, updated_at: now,
        }, { onConflict: 'user_id' });
        if (error) throw error;
      }
    } catch {
      // Table missing / Supabase unreachable → memory keeps login working.
    }
    return profile;
  }

  assertConfigured(): void {
    if (!this.rosterConfigured()) {
      throw new ServiceUnavailableException(
        'Student login is disabled: set STUDENT_ACCOUNTS on the API project (see docs/ADMIN.md §8).',
      );
    }
  }
}
