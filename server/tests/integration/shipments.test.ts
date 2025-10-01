import request from 'supertest';
import { app, loginTestUser } from '../helpers/auth';

describe('Shipments', () => {
  let cookie: string; let orderId: string; let shipmentId: string;
  beforeAll(async () => {
    const { cookie: c } = await loginTestUser('ADMIN');
    cookie = c;
    // Create item & order
    const item = await request(app).post('/api/items').set('Cookie', cookie).send({ name: 'ShipItem', sku: 'SHIP-1', quantity: 20, priceCents: 300 });
    const itemId = item.body.data.item.id;
    const order = await request(app).post('/api/orders').set('Cookie', cookie).send({ items: [{ itemId, quantity: 2 }] });
    orderId = order.body.data.order.id;
  });
  test('create/list/update/delete shipment', async () => {
    const create = await request(app).post('/api/shipments').set('Cookie', cookie).send({ orderId, carrier: 'UPS', trackingNumber: 'TRACK123', destination: 'NYC' });
    expect(create.status).toBe(201); shipmentId = create.body.data.shipment.id;
    const list = await request(app).get('/api/shipments').set('Cookie', cookie);
    expect(list.status).toBe(200);
    const updateStatus = await request(app).put(`/api/shipments/${shipmentId}/status`).set('Cookie', cookie).send({ status: 'In Transit' });
    expect(updateStatus.status).toBe(200);
  const updateFull = await request(app).put(`/api/shipments/${shipmentId}`).set('Cookie', cookie).send({ destination: 'LA', status: 'Delivered' });
  expect(updateFull.status).toBe(200);
    const stats = await request(app).get('/api/shipments/stats').set('Cookie', cookie);
    expect(stats.status).toBe(200);
    const del = await request(app).delete(`/api/shipments/${shipmentId}`).set('Cookie', cookie);
    expect(del.status).toBe(204);
  });
});