import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { ProgressService } from '../progress/progress.service';

const WEEK_MS = 7 * 24 * 3600 * 1000;

/**
 * Weekly class leaderboard: XP earned on `chapter:*` topics in the last
 * 7 days, optionally filtered by classId (resolved via the catalog).
 * Opt-in by playing — only learners with chapter events appear.
 */
@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly progress: ProgressService,
    private readonly catalog: CatalogService,
  ) {}

  @Get()
  async board(
    @Query('classId') classId?: string,
    @Query('limit') limitRaw?: string,
    @Query('user_id') userId?: string,
  ) {
    const limit = Math.min(50, Math.max(1, parseInt(limitRaw ?? '10', 10) || 10));
    const since = Date.now() - WEEK_MS;
    const entries = (await this.progress.all()).filter(
      (e) => e.topic.startsWith('chapter:') && new Date(e.updated_at).getTime() >= since,
    );
    const byUser = new Map<string, { xp: number; chapters: Set<string> }>();
    for (const e of entries) {
      const chapterId = e.topic.slice('chapter:'.length);
      if (classId && this.catalog.classOfChapter(chapterId) !== classId) continue;
      let row = byUser.get(e.user_id);
      if (!row) {
        row = { xp: 0, chapters: new Set() };
        byUser.set(e.user_id, row);
      }
      row.xp += e.xp ?? 0;
      row.chapters.add(chapterId);
    }
    const rows = [...byUser.entries()]
      .map(([user_id, r]) => ({ user_id, xp: r.xp, chapters: r.chapters.size }))
      .sort((a, b) => b.xp - a.xp)
      .map((r, i) => ({ rank: i + 1, ...r }));
    const yourRank = userId ? rows.find((r) => r.user_id === userId)?.rank ?? null : null;
    return {
      classId: classId ?? 'all',
      weekSince: new Date(since).toISOString(),
      rows: rows.slice(0, limit),
      yourRank,
    };
  }
}
