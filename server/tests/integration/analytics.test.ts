import request from 'supertest';
import { app, loginTestUser } from '../helpers/auth';

describe('Analytics summary', () => {
  let cookie: string;
  beforeAll(async () => {
    const { cookie: c } = await loginTestUser('ADMIN'); cookie = c;
    // seed a couple items
    await request(app).post('/api/items').set('Cookie', cookie).send({ name: 'A1', sku: 'AN-1', quantity: 3, priceCents: 500 });
    await request(app).post('/api/items').set('Cookie', cookie).send({ name: 'A2', sku: 'AN-2', quantity: 4, priceCents: 1500 });
  });
  test('returns analytics summary structure', async () => {
    const res = await request(app).get('/api/analytics/summary').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});