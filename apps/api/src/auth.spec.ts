import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';

describe('Student auth (env roster + token + profile)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ADMIN_API_KEY = 'test-admin-key';
    process.env.STUDENT_TOKEN_SECRET = 'test-student-secret';
    process.env.STUDENT_ACCOUNTS = 'rahim-01:1234,mina-02:5678';
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
  afterAll(async () => app?.close());

  it('POST /api/auth/login succeeds and reports firstLogin', async () => {
    const r = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ studentId: 'rahim-01', pin: '1234' });
    expect(r.status).toBe(201);
    expect(r.body.token).toMatch(/^rahim-01\./);
    expect(r.body.firstLogin).toBe(true);
  });

  it('rejects wrong PIN and unknown IDs', async () => {
    const bad = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ studentId: 'rahim-01', pin: '0000' });
    expect(bad.status).toBe(401);
    const ghost = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ studentId: 'nobody-99', pin: '1234' });
    expect(ghost.status).toBe(401);
  });

  it('PUT /api/auth/profile creates the profile; /me shows complete', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ studentId: 'mina-02', pin: '5678' });
    const token = login.body.token as string;

    const save = await request(app.getHttpServer())
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mina', classId: 'class-2', avatar: '🐰' });
    expect(save.status).toBe(200);
    expect(save.body.classId).toBe('class-2');

    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(me.body.profileComplete).toBe(true);
    expect(me.body.profile.name).toBe('Mina');

    const again = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ studentId: 'mina-02', pin: '5678' });
    expect(again.body.firstLogin).toBe(false);
  });

  it('rejects bad classId and missing/invalid tokens', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ studentId: 'rahim-01', pin: '1234' });
    const token = login.body.token as string;

    const badClass = await request(app.getHttpServer())
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'R', classId: 'class-9' });
    expect(badClass.status).toBe(400);

    const noToken = await request(app.getHttpServer()).get('/api/auth/me');
    expect(noToken.status).toBe(401);
    const forged = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer rahim-01.ever.forged');
    expect(forged.status).toBe(401);
  });
});
