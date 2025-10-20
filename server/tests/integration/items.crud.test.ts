import request from 'supertest';
import { app, loginTestUser } from '../helpers/auth';

describe('Items CRUD', () => {
  let cookie: string;
  beforeAll(async () => {
    const { cookie: c } = await loginTestUser('ADMIN');
    cookie = c;
  });

  test('create -> list -> get -> update -> restock -> delete', async () => {
  const create = await request(app).post('/api/items').set('Cookie', cookie).send({ name: 'Widget', sku: 'WID-1', quantity: 5, priceCents: 1999 });
    expect(create.status).toBe(201);
    const itemId = create.body.data.item.id;

    const list = await request(app).get('/api/items').set('Cookie', cookie);
    expect(list.status).toBe(200);
    expect(list.body.data.items.length).toBeGreaterThan(0);

    const get = await request(app).get(`/api/items/${itemId}`).set('Cookie', cookie);
    expect(get.status).toBe(200);

  const update = await request(app).put(`/api/items/${itemId}`).set('Cookie', cookie).send({ name: 'Widget 2', priceCents: 2450 });
    expect(update.status).toBe(200);
    expect(update.body.data.item.name).toBe('Widget 2');

  const restock = await request(app).post(`/api/items/${itemId}/restock`).set('Cookie', cookie).send({ amount: 10 });
    expect(restock.status).toBe(200);
  expect(restock.body.data.item.quantity).toBe(15);

  const del = await request(app).delete(`/api/items/${itemId}`).set('Cookie', cookie);
  expect(del.status).toBe(204);
  });

  test('reject invalid create (missing required fields / invalid priceCents)', async () => {
    const bad1 = await request(app).post('/api/items').set('Cookie', cookie).send({ sku: 'ONLYSKU' });
    expect([400,422]).toContain(bad1.status);
    expect(bad1.body?.message || bad1.body?.error || '').toMatch(/validation|invalid/i);
    const bad2 = await request(app).post('/api/items').set('Cookie', cookie).send({ name: 'X', sku: 'X-1', quantity: 5, priceCents: -10 });
    expect([400,422]).toContain(bad2.status);
    expect(bad2.body?.message || bad2.body?.error || '').toMatch(/price|validation|negative/i);
  }, 10000);
});
