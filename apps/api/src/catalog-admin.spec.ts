import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';

describe('Control plane (catalog + admin + summary)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ADMIN_API_KEY = 'test-admin-key';
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
  afterAll(async () => app?.close());

  it('GET /api/catalog/courses lists the 9 foundation courses', async () => {
    const r = await request(app.getHttpServer()).get('/api/catalog/courses');
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(10);
  });

  it('GET /api/catalog/courses/c1-math returns chapter tree', async () => {
    const r = await request(app.getHttpServer()).get('/api/catalog/courses/c1-math');
    expect(r.status).toBe(200);
    expect(r.body.chapters).toHaveLength(2);
    expect(r.body.chapters[0].lessons).toEqual([]);
  });

  it('GET /api/catalog/video-courses lists the demo course', async () => {
    const r = await request(app.getHttpServer()).get('/api/catalog/video-courses');
    expect(r.status).toBe(200);
    expect(r.body[0].lectureCount).toBe(2);
  });

  it('admin routes reject missing/invalid keys', async () => {
    const noKey = await request(app.getHttpServer()).put('/api/admin/lessons').send({});
    expect(noKey.status).toBe(403);
    const badKey = await request(app.getHttpServer())
      .put('/api/admin/lessons')
      .set('x-admin-key', 'wrong')
      .send({});
    expect(badKey.status).toBe(403);
  });

  it('PUT + DELETE /api/admin/lessons round-trips into the catalog tree', async () => {
    const put = await request(app.getHttpServer())
      .put('/api/admin/lessons')
      .set('x-admin-key', 'test-admin-key')
      .send({
        id: 'c1-ma-co-1', chapterId: 'c1-ma-count',
        titleBn: '১–২০ গণনা', titleEn: 'Count to 20', kind: 'interactive', xp: 10,
      });
    expect(put.status).toBe(200);
    expect(put.body.id).toBe('c1-ma-co-1');

    const tree = await request(app.getHttpServer()).get('/api/catalog/courses/c1-math');
    const chapter = tree.body.chapters.find((c: { id: string }) => c.id === 'c1-ma-count');
    expect(chapter.lessons.map((l: { id: string }) => l.id)).toContain('c1-ma-co-1');

    const del = await request(app.getHttpServer())
      .delete('/api/admin/lessons/c1-ma-co-1')
      .set('x-admin-key', 'test-admin-key');
    expect(del.status).toBe(200);
  });

  it('PUT /api/admin/lessons validates kind and xp', async () => {
    const r = await request(app.getHttpServer())
      .put('/api/admin/lessons')
      .set('x-admin-key', 'test-admin-key')
      .send({
        id: 'bad', chapterId: 'c1-ma-count',
        titleBn: 'x', titleEn: 'y', kind: 'song', xp: 999,
      });
    expect(r.status).toBe(400);
  });

  it('PUT /api/admin/lectures auto-creates a section under the course', async () => {
    const put = await request(app.getHttpServer())
      .put('/api/admin/lectures')
      .set('x-admin-key', 'test-admin-key')
      .send({
        id: 'test-l1', title: 'Test lecture', provider: 'youtube',
        sourceUrl: 'https://youtu.be/dQw4w9WgXcQ', courseId: 'gonit-1-intro',
      });
    expect(put.status).toBe(200);
    const tree = await request(app.getHttpServer()).get('/api/catalog/video-courses/gonit-1-intro');
    expect(tree.body.sections.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/admin/stats + /students reflect progress events', async () => {
    await request(app.getHttpServer()).post('/api/progress').send({
      user_id: 'student-1', topic: 'counting', xp: 10, progress_percentage: 50,
    });
    const stats = await request(app.getHttpServer())
      .get('/api/admin/stats')
      .set('x-admin-key', 'test-admin-key');
    expect(stats.status).toBe(200);
    expect(stats.body.students).toBeGreaterThanOrEqual(1);
    expect(stats.body.catalog.lessons).toBeGreaterThanOrEqual(0);

    const students = await request(app.getHttpServer())
      .get('/api/admin/students')
      .set('x-admin-key', 'test-admin-key');
    expect(students.body.map((s: { user_id: string }) => s.user_id)).toContain('student-1');
  });

  it('PUT /api/admin/courses + chapters creates a new branch of the tree', async () => {
    const course = await request(app.getHttpServer())
      .put('/api/admin/courses')
      .set('x-admin-key', 'test-admin-key')
      .send({ id: 'c9-test', classId: 'class-9', subject: 'physics', titleBn: 'টেস্ট', titleEn: 'Test' });
    expect(course.status).toBe(200);
    const chapter = await request(app.getHttpServer())
      .put('/api/admin/chapters')
      .set('x-admin-key', 'test-admin-key')
      .send({ id: 'c9-ch1', courseId: 'c9-test', titleBn: 'অধ্যায় ১', titleEn: 'Chapter 1' });
    expect(chapter.status).toBe(200);
    const tree = await request(app.getHttpServer()).get('/api/catalog/courses/c9-test');
    expect(tree.status).toBe(200);
    expect(tree.body.chapters.map((c: { id: string }) => c.id)).toContain('c9-ch1');
  });

  it('PUT + DELETE /api/admin/sections manages video sections with cascade', async () => {
    const put = await request(app.getHttpServer())
      .put('/api/admin/sections')
      .set('x-admin-key', 'test-admin-key')
      .send({ id: 'gonit-1-intro-s9', courseId: 'gonit-1-intro', title: 'Extra' });
    expect(put.status).toBe(200);
    const bad = await request(app.getHttpServer())
      .put('/api/admin/sections')
      .set('x-admin-key', 'test-admin-key')
      .send({ id: 'gonit-1-intro-s9', courseId: 'nope', title: 'X' });
    expect(bad.status).toBe(404);
    const del = await request(app.getHttpServer())
      .delete('/api/admin/sections/gonit-1-intro-s9')
      .set('x-admin-key', 'test-admin-key');
    expect(del.status).toBe(200);
    expect(del.body.lecturesRemoved).toBe(0);
  });

  it('PUT /api/admin/lectures validates checkpoints', async () => {
    const bad = await request(app.getHttpServer())
      .put('/api/admin/lectures')
      .set('x-admin-key', 'test-admin-key')
      .send({
        id: 'test-cp', title: 'CP', provider: 'youtube',
        sourceUrl: 'https://youtu.be/dQw4w9WgXcQ', courseId: 'gonit-1-intro',
        checkpoints: [{ atSec: 10, prompt: '', choices: ['only-one'], correctChoiceIndex: 5 }],
      });
    expect(bad.status).toBe(400);
    const good = await request(app.getHttpServer())
      .put('/api/admin/lectures')
      .set('x-admin-key', 'test-admin-key')
      .send({
        id: 'test-cp', title: 'CP', provider: 'youtube',
        sourceUrl: 'https://youtu.be/dQw4w9WgXcQ', courseId: 'gonit-1-intro',
        checkpoints: [{ atSec: 30, prompt: '১+১?', choices: ['১', '২'], correctChoiceIndex: 1, xp: 5 }],
      });
    expect(good.status).toBe(200);
    expect(good.body.checkpoints).toHaveLength(1);
    await request(app.getHttpServer())
      .delete('/api/admin/lectures/test-cp')
      .set('x-admin-key', 'test-admin-key');
  });

  it('PUT /api/admin/lessons stores manual voice-over fields', async () => {
    const put = await request(app.getHttpServer())
      .put('/api/admin/lessons')
      .set('x-admin-key', 'test-admin-key')
      .send({
        id: 'c1-bn-sh-1', chapterId: 'c1-bn-sworoborno',
        titleBn: 'অক্ষর জোড়া', titleEn: 'Join letters', kind: 'interactive', xp: 10,
        audioUrl: 'https://cdn.example.com/voice/c1-bn-sh-1.mp3', audioText: 'অক্ষর জোড়া দাও',
      });
    expect(put.status).toBe(200);
    expect(put.body.audioUrl).toContain('c1-bn-sh-1.mp3');
    await request(app.getHttpServer())
      .delete('/api/admin/lessons/c1-bn-sh-1')
      .set('x-admin-key', 'test-admin-key');
  });

  it('falls back to memory when the Supabase table is missing', async () => {
    const { ProgressService } = await import('./progress/progress.service');
    const { SupabaseService } = await import('./supabase/supabase.service');
    const failing = { client: () => ({ from: () => { throw new Error('no table'); } }) };
    const svc = new ProgressService(failing as unknown as SupabaseService);
    const entry = await svc.upsert('u9', 'counting', 10, 50);
    expect(entry.xp).toBe(10);
    expect(await svc.all()).toHaveLength(1);
    expect(await svc.list('u9')).toHaveLength(1);
  });

  it('PUT + DELETE /api/admin/custom-books manages guide books', async () => {
    const put = await request(app.getHttpServer())
      .put('/api/admin/custom-books')
      .set('x-admin-key', 'test-admin-key')
      .send({
        id: 'guide-1', classId: 'class-1', titleBn: 'গাইড', titleEn: 'Guide',
        driveFileId: '1ABCDEFghijKLMNOPqrstu', note: 'extra',
      });
    expect(put.status).toBe(200);
    const bad = await request(app.getHttpServer())
      .put('/api/admin/custom-books')
      .set('x-admin-key', 'test-admin-key')
      .send({ id: 'guide-2', classId: 'class-1', titleBn: 'x', titleEn: 'y', driveFileId: 'short' });
    expect(bad.status).toBe(400);
    const list = await request(app.getHttpServer()).get('/api/catalog/custom-books');
    expect(list.body.map((b: { id: string }) => b.id)).toContain('guide-1');
    const del = await request(app.getHttpServer())
      .delete('/api/admin/custom-books/guide-1')
      .set('x-admin-key', 'test-admin-key');
    expect(del.status).toBe(200);
  });

  it('GET /api/leaderboard ranks weekly chapter XP per class', async () => {
    await request(app.getHttpServer()).post('/api/progress').send({
      user_id: 'lb-anna', topic: 'chapter:c1-ma-count', xp: 40, progress_percentage: 100,
    });
    await request(app.getHttpServer()).post('/api/progress').send({
      user_id: 'lb-bob', topic: 'chapter:c1-ma-count', xp: 20, progress_percentage: 50,
    });
    const all = await request(app.getHttpServer()).get('/api/leaderboard').query({ classId: 'class-1' });
    expect(all.status).toBe(200);
    expect(all.body.rows[0].user_id).toBe('lb-anna');
    expect(all.body.rows[0].rank).toBe(1);
    const other = await request(app.getHttpServer()).get('/api/leaderboard').query({ classId: 'class-2' });
    expect(other.body.rows.find((r: { user_id: string }) => r.user_id === 'lb-anna')).toBeUndefined();
    const ranked = await request(app.getHttpServer())
      .get('/api/leaderboard')
      .query({ classId: 'class-1', user_id: 'lb-bob' });
    expect(ranked.body.yourRank).toBe(2);
  });

  it('GET /api/progress/summary rolls up a student', async () => {
    const r = await request(app.getHttpServer())
      .get('/api/progress/summary')
      .query({ user_id: 'student-1' });
    expect(r.status).toBe(200);
    expect(r.body.totalXp).toBeGreaterThanOrEqual(10);
    expect(r.body.topicsCompleted).toBeGreaterThanOrEqual(1);
  });
});
