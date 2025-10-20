import request from 'supertest';
import { app, loginTestUser } from '../helpers/auth';

describe('Search', () => {
  let cookie: string; let createdIds: string[] = [];
  beforeAll(async () => {
    const { cookie: c } = await loginTestUser('ADMIN');
    cookie = c;
    for (let i=0;i<3;i++) {
      const r = await request(app).post('/api/items').set('Cookie', cookie).send({ name: `SearchItem${i}`, sku: `SITEM-${i}`, quantity: 5, priceCents: 100 + i });
      createdIds.push(r.body.data.item.id);
    }
  });
  test('search items basic pagination', async () => {
    const res1 = await request(app).get('/api/search?q=SearchItem&type=items&page=1&pageSize=2').set('Cookie', cookie);
    expect(res1.status).toBe(200);
    expect(res1.body.data.items.length).toBeLessThanOrEqual(2);
  });
});