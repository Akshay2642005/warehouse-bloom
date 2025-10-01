import request from 'supertest';
import { createApp } from '../../src/app';
import { createTestUser, DEFAULT_TEST_PASSWORD } from '../factories/user.factory';

const app = createApp();

export async function loginTestUser(role: 'admin' | 'user' = 'admin') {
  const user = await createTestUser({ role });
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password: DEFAULT_TEST_PASSWORD });
  return { user, token: res.body?.data?.token, cookie: res.headers['set-cookie']?.[0], app };
}

export { app };
