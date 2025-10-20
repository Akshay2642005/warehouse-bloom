import request from 'supertest';
import { app, loginTestUser } from '../helpers/auth';
import { prisma } from '../../src/utils/prisma';

describe('Notifications', () => {
  let cookie: string;
  let userId: string;
  beforeAll(async () => {
    const { cookie: c, user } = await loginTestUser('ADMIN');
    cookie = c; userId = user.id;
    await prisma.notification.create({ data: { userId, message: 'Test notice', type: 'info' } });
  });
  test('list and unread count then mark read/all', async () => {
    const list = await request(app).get('/api/notifications').set('Cookie', cookie);
    expect(list.status).toBe(200);
    const id = list.body.data.notifications[0].id;
    const count = await request(app).get('/api/notifications/unread-count').set('Cookie', cookie);
    expect(count.status).toBe(200);
    expect(count.body.data.count).toBeGreaterThanOrEqual(1);
  const mark = await request(app).post(`/api/notifications/${id}/mark`).set('Cookie', cookie);
    expect(mark.status).toBe(200);
  const markAll = await request(app).post('/api/notifications/mark-all').set('Cookie', cookie);
    expect(markAll.status).toBe(200);
  });
});