/// <reference types="jest" />
import request from 'supertest';
// Jest globals (describe, test, expect) are provided via ts-jest and configured in tsconfig types.
import { app, loginTestUser } from '../helpers/auth';
import { createTestUser } from '../factories/user.factory';

describe('Invitations', () => {
  let adminCookie: string;
  beforeAll(async () => {
    const { cookie } = await loginTestUser('admin');
    adminCookie = cookie;
  });

  test('create and list invitation (existing user required) then reject invalid accept', async () => {
    // Create an existing user that will be invited (business rule requires existing user email)
    const existing = await createTestUser({ role: 'user' });
    const create = await request(app).post('/api/invitations').set('Cookie', adminCookie).send({ email: existing.email, role: 'user' });
    expect(create.status).toBe(201); // Should succeed for existing user
    const list = await request(app).get('/api/invitations').set('Cookie', adminCookie);
    expect(list.status).toBe(200);
    expect(list.body.data.invitations.length).toBeGreaterThan(0);
    const badAccept = await request(app).post('/api/invitations/accept').send({ token: 'short' });
    expect([400,422]).toContain(badAccept.status);
    // Attempt invite for non-existing user should fail
    const badInvite = await request(app).post('/api/invitations').set('Cookie', adminCookie).send({ email: 'nonexistent-user-example@test.dev', role: 'user' });
    expect(badInvite.status).toBe(400);
  });
});