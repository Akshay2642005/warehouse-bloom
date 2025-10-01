import request from 'supertest';
import { app } from '../helpers/auth';
import { prisma } from '../../src/utils/prisma';

describe('Auth Flow', () => {
  test('register -> login -> me', async () => {
    const email = `reg_${Date.now()}@test.com`;
    const password = 'Password123!';

    const reg = await request(app).post('/api/auth/register').send({ email, password });
    expect(reg.status).toBe(201);
    expect(reg.body.success).toBe(true);

    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0];
    expect(login.body.data.user.email).toBe(email);

    const me = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(email);
  });

  test('invalid credentials (wrong password format + wrong user)', async () => {
    const login1 = await request(app).post('/api/auth/login').send({ email: 'none@test.com', password: 'Invalid123!' });
    expect(login1.status).toBe(401);
    // Create a user and try wrong password
    const email = `up_${Date.now()}@test.com`;
    await request(app).post('/api/auth/register').send({ email, password: 'Password123!' });
    const bad = await request(app).post('/api/auth/login').send({ email, password: 'Password321!' });
    expect(bad.status).toBe(401);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
