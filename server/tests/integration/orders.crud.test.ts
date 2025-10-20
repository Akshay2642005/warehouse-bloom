import request from 'supertest';
import { app, loginTestUser } from '../helpers/auth';

/**
 * Order lifecycle integration test:
 * 1. Create an item (stock 10)
 * 2. Create order for quantity 3
 * 3. Verify order created and item stock decremented
 * 4. List orders -> contains order
 * 5. Update order status to SHIPPED
 */

describe('Orders lifecycle', () => {
  let cookie: string;

  beforeAll(async () => {
    const { cookie: c } = await loginTestUser('ADMIN');
    cookie = c;
  });

  test('full order lifecycle (create item -> create order -> list -> status update)', async () => {
    // Create item
    const createItem = await request(app).post('/api/items').set('Cookie', cookie)
      .send({ name: 'Orderable', sku: 'ORD-ITEM', quantity: 10, priceCents: 500 });
    expect(createItem.status).toBe(201);
    const itemId = createItem.body.data.item.id;

    // Create order
    const createOrder = await request(app).post('/api/orders').set('Cookie', cookie)
      .send({ items: [{ itemId, quantity: 3 }] });
    expect(createOrder.status).toBe(201);
    const orderId = createOrder.body.data.order.id;

    // Item stock decremented
    const getItem = await request(app).get(`/api/items/${itemId}`).set('Cookie', cookie);
    expect(getItem.status).toBe(200);
    expect(getItem.body.data.item.quantity).toBe(7);

    // List orders contains it
    const list = await request(app).get('/api/orders').set('Cookie', cookie);
    expect(list.status).toBe(200);
    expect(list.body.data.orders.some((o: any) => o.id === orderId)).toBe(true);

    // Update status
    const update = await request(app).put(`/api/orders/${orderId}/status`).set('Cookie', cookie)
      .send({ status: 'SHIPPED' });
    expect(update.status).toBe(200);
  }, 15000);

  test('reject invalid order (no items)', async () => {
    const bad = await request(app).post('/api/orders').set('Cookie', cookie).send({ items: [] });
    expect([400,422]).toContain(bad.status);
  }, 8000);
});
