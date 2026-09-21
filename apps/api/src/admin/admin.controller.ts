import {
  Body, Controller, Delete, Get, Param, Put, UseGuards,
} from '@nestjs/common';
import {
  IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength,
} from 'class-validator';
import { AdminGuard } from './admin.guard';
import { CatalogService, LessonKind, VideoProvider } from '../catalog/catalog.service';
import { ProgressService } from '../progress/progress.service';

class LessonDto {
  @IsString() @MinLength(1) @MaxLength(120) id!: string;
  @IsString() @MinLength(1) chapterId!: string;
  @IsString() @MinLength(1) @MaxLength(160) titleBn!: string;
  @IsString() @MinLength(1) @MaxLength(160) titleEn!: string;
  @IsIn(['interactive', 'video', 'quiz']) kind!: LessonKind;
  @IsOptional() @IsString() @MaxLength(160) refId?: string;
  @IsOptional() @IsInt() @Min(0) @Max(500) xp?: number;
  @IsOptional() @IsString() @MaxLength(500) audioUrl?: string;
  @IsOptional() @IsString() @MaxLength(500) audioText?: string;
}

class VideoCourseDto {
  @IsString() @MinLength(1) @MaxLength(120) id!: string;
  @IsString() @MinLength(1) @MaxLength(160) titleBn!: string;
  @IsString() @MinLength(1) @MaxLength(160) titleEn!: string;
  @IsOptional() @IsString() @MaxLength(60) classId?: string;
  @IsOptional() @IsString() @MaxLength(60) subject?: string;
}

class LectureDto {
  @IsString() @MinLength(1) @MaxLength(120) id!: string;
  @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @IsIn(['youtube', 'google-drive', 'terabox', 'direct']) provider!: VideoProvider;
  @IsString() @MinLength(1) @MaxLength(500) sourceUrl!: string;
  @IsOptional() @IsString() @MaxLength(120) sectionId?: string;
  @IsOptional() @IsString() @MaxLength(120) courseId?: string;
  @IsOptional() @IsString() @MaxLength(160) sectionTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) directUrl?: string;
  @IsOptional() @IsInt() @Min(0) @Max(24 * 3600) durationSec?: number;
}

class CourseDto {
  @IsString() @MinLength(1) @MaxLength(120) id!: string;
  @IsString() @MinLength(1) @MaxLength(60) classId!: string;
  @IsString() @MinLength(1) @MaxLength(60) subject!: string;
  @IsString() @MinLength(1) @MaxLength(160) titleBn!: string;
  @IsString() @MinLength(1) @MaxLength(160) titleEn!: string;
}

class ChapterDto {
  @IsString() @MinLength(1) @MaxLength(120) id!: string;
  @IsString() @MinLength(1) @MaxLength(120) courseId!: string;
  @IsString() @MinLength(1) @MaxLength(160) titleBn!: string;
  @IsString() @MinLength(1) @MaxLength(160) titleEn!: string;
}

class SectionDto {
  @IsString() @MinLength(1) @MaxLength(120) id!: string;
  @IsString() @MinLength(1) @MaxLength(120) courseId!: string;
  @IsString() @MinLength(1) @MaxLength(160) title!: string;
}

/**
 * Admin control plane. Every route is guarded by AdminGuard
 * (`x-admin-key` === ADMIN_API_KEY). Writes mutate the catalog the
 * storefront reads at GET /api/catalog/*.
 */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly progress: ProgressService,
  ) {}

  @Put('lessons')
  upsertLesson(@Body() dto: LessonDto) {
    return this.catalog.upsertLesson(dto);
  }
  @Delete('lessons/:id')
  deleteLesson(@Param('id') id: string) {
    return this.catalog.deleteLesson(decodeURIComponent(id));
  }

  @Put('courses')
  upsertCourse(@Body() dto: CourseDto) {
    return this.catalog.upsertCourse(dto);
  }

  @Put('chapters')
  upsertChapter(@Body() dto: ChapterDto) {
    return this.catalog.upsertChapter(dto);
  }

  @Put('video-courses')
  upsertVideoCourse(@Body() dto: VideoCourseDto) {
    return this.catalog.upsertVideoCourse(dto);
  }

  @Put('sections')
  upsertSection(@Body() dto: SectionDto) {
    return this.catalog.upsertSection(dto);
  }

  @Delete('sections/:id')
  deleteSection(@Param('id') id: string) {
    return this.catalog.deleteSection(decodeURIComponent(id));
  }

  @Put('lectures')
  upsertLecture(@Body() dto: LectureDto) {
    return this.catalog.upsertLecture(dto);
  }

  @Delete('lectures/:id')
  deleteLecture(@Param('id') id: string) {
    return this.catalog.deleteLecture(decodeURIComponent(id));
  }

  /** Every logged-in user counts as a Student: one row per user_id. */
  @Get('students')
  async students() {
    const entries = await this.progress.all();
    const byUser = new Map<string, { xp: number; topics: Set<string>; streak: number; last: string | null }>();
    for (const e of entries) {
      let row = byUser.get(e.user_id);
      if (!row) {
        row = { xp: 0, topics: new Set(), streak: 0, last: null };
        byUser.set(e.user_id, row);
      }
      row.xp += e.xp ?? 0;
      row.topics.add(e.topic);
      row.streak = Math.max(row.streak, e.streak_days ?? 0);
      if (!row.last || e.updated_at > row.last) row.last = e.updated_at;
    }
    return [...byUser.entries()].map(([user_id, r]) => ({
      user_id, totalXp: r.xp, topicsCompleted: r.topics.size,
      streakDays: r.streak, lastActive: r.last,
    }));
  }

  /** Platform analytics for the admin Stats tab. */
  @Get('stats')
  async stats() {
    const entries = await this.progress.all();
    const students = new Set(entries.map((e) => e.user_id)).size;
    const totalXp = entries.reduce((n, e) => n + (e.xp ?? 0), 0);
    const perTopic = new Map<string, number>();
    for (const e of entries) perTopic.set(e.topic, (perTopic.get(e.topic) ?? 0) + 1);
    return {
      students,
      progressEvents: entries.length,
      totalXp,
      catalog: this.catalog.counts(),
      topTopics: [...perTopic.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic, events]) => ({ topic, events })),
    };
  }
}
