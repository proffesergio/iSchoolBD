import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';

describe('API (TDD: red -> green)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(async () => app?.close());

  it('GET /api/health -> ok', async () => {
    const r = await request(app.getHttpServer()).get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ok');
  });

  it('GET /api/learn/letters includes ক + স্বরবর্ণ', async () => {
    const r = await request(app.getHttpServer()).get('/api/learn/letters');
    expect(r.status).toBe(200);
    expect(r.body.letters).toContain('ক');
    expect(r.body.letters).toContain('অ');
  });

  it('GET /api/learn/talking-letter/ক matches strict engine contract', async () => {
    const r = await request(app.getHttpServer()).get('/api/learn/talking-letter/ক');
    expect(r.status).toBe(200);
    expect(r.body.module_metadata.tier).toBe('tier_1');
    expect(r.body.ui_component.type).toBe('talking_letter');
    expect(r.body.content.interactive_script.length).toBeGreaterThan(0);
    expect(r.body.gamification.xp_reward).toBeGreaterThanOrEqual(0);
    expect(r.body.content.challenge.correct_answer_index).toBe(0);
  });

  it('GET /api/learn/talking-letter/Ω -> 404 with helpful list', async () => {
    const r = await request(app.getHttpServer()).get('/api/learn/talking-letter/%CE%A9');
    expect(r.status).toBe(404);
  });

  it('POST + GET /api/progress round-trips XP (in-memory fallback)', async () => {
    const post = await request(app.getHttpServer()).post('/api/progress').send({
      user_id: 'test-kid-1', topic: 'sworoborna_ক', xp: 10, progress_percentage: 10,
    });
    expect(post.status).toBe(201);
    const list = await request(app.getHttpServer()).get('/api/progress').query({ user_id: 'test-kid-1' });
    expect(list.status).toBe(200);
    expect(list.body[0].xp).toBeGreaterThanOrEqual(10);
  });
});
