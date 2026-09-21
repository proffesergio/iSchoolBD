import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ProgressEntry {
  user_id: string;
  topic: string;
  xp: number;
  progress_percentage: number;
  streak_days: number;
  updated_at: string;
}

@Injectable()
export class ProgressService {
  // In-memory fallback for local dev / tests without Supabase env.
  private mem = new Map<string, ProgressEntry>();

  constructor(private readonly sb: SupabaseService) {}

  private key(user_id: string, topic: string) {
    return `${user_id}:${topic}`;
  }

  async upsert(user_id: string, topic: string, xp: number, progress_percentage: number) {
    const client = this.sb.client();
    const entry: ProgressEntry = {
      user_id, topic, xp, progress_percentage,
      streak_days: 1, updated_at: new Date().toISOString(),
    };
    if (!client) {
      const prev = this.mem.get(this.key(user_id, topic));
      const merged = { ...entry, xp: (prev?.xp ?? 0) + xp, streak_days: (prev?.streak_days ?? 0) + 1 };
      this.mem.set(this.key(user_id, topic), merged);
      return merged;
    }
    const { data, error } = await client.from('progress').upsert(entry, { onConflict: 'user_id,topic' }).select().single();
    if (error) throw error;
    return data as ProgressEntry;
  }

  async list(user_id: string) {
    const client = this.sb.client();
    if (!client) return [...this.mem.values()].filter((e) => e.user_id === user_id);
    const { data, error } = await client.from('progress').select('*').eq('user_id', user_id);
    if (error) throw error;
    return data as ProgressEntry[];
  }
}
