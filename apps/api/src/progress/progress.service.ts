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
    const entry: ProgressEntry = {
      user_id, topic, xp, progress_percentage,
      streak_days: 1, updated_at: new Date().toISOString(),
    };
    const fallback = () => {
      const prev = this.mem.get(this.key(user_id, topic));
      const merged = { ...entry, xp: (prev?.xp ?? 0) + xp, streak_days: (prev?.streak_days ?? 0) + 1 };
      this.mem.set(this.key(user_id, topic), merged);
      return merged;
    };
    const client = this.sb.client();
    if (!client) return fallback();
    try {
      const { data, error } = await client.from('progress').upsert(entry, { onConflict: 'user_id,topic' }).select().single();
      if (error) throw error;
      return data as ProgressEntry;
    } catch {
      // Table missing / Supabase unreachable → memory so the app keeps working.
      return fallback();
    }
  }

  async list(user_id: string) {
    const client = this.sb.client();
    if (!client) return [...this.mem.values()].filter((e) => e.user_id === user_id);
    try {
      const { data, error } = await client.from('progress').select('*').eq('user_id', user_id);
      if (error) throw error;
      return data as ProgressEntry[];
    } catch {
      return [...this.mem.values()].filter((e) => e.user_id === user_id);
    }
  }

  /** All entries (admin + analytics). In-memory fallback returns the local map. */
  async all() {
    const client = this.sb.client();
    if (!client) return [...this.mem.values()];
    try {
      const { data, error } = await client.from('progress').select('*').limit(5000);
      if (error) throw error;
      return data as ProgressEntry[];
    } catch {
      return [...this.mem.values()];
    }
  }

  /** Per-student analytics rollup for the Student dashboard. */
  async summary(user_id: string) {
    const entries = await this.list(user_id);
    const totalXp = entries.reduce((n, e) => n + (e.xp ?? 0), 0);
    const streakDays = entries.reduce((n, e) => Math.max(n, e.streak_days ?? 0), 0);
    const topics = [...new Set(entries.map((e) => e.topic))];
    const lastActive = entries.map((e) => e.updated_at).sort().pop() ?? null;
    return { user_id, totalXp, topicsCompleted: topics.length, streakDays, lastActive, entries };
  }
}
