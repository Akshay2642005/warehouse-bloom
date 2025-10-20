import request from 'supertest';
import { app } from '../helpers/auth';
import { prisma } from '../../src/utils/prisma';

describe('User Profile Management', () => {
  let user: any;
  let authToken: string;

  beforeEach(async () => {
    // Create and authenticate a user for each test
    const userPayload = {
      email: `testuser${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userPayload);

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userPayload.email,
        password: userPayload.password
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.headers['set-cookie']?.[0] || '';
    user = loginResponse.body.data.user;
  });

  describe('Profile Updates', () => {
    test('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Test User',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Cookie', authToken)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.avatarUrl).toBe(updateData.avatarUrl);
      expect(response.body.data.user.email).toBe(user.email); // email unchanged
    });

    test('should update email with confirmation', async () => {
      const newEmail = `updated${Date.now()}@example.com`;
      const updateData = {
        email: newEmail,
        confirmEmail: newEmail
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Cookie', authToken)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(newEmail);
    });

    test('should reject email update with mismatched confirmation', async () => {
      const updateData = {
        email: 'newemail@example.com',
        confirmEmail: 'different@example.com'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Cookie', authToken)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    test('should reject duplicate email', async () => {
      // Create another user first
      const anotherUserPayload = {
        email: `another${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Another User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(anotherUserPayload);

      // Try to update current user with the other user's email
      const updateData = {
        email: anotherUserPayload.email,
        confirmEmail: anotherUserPayload.email
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Cookie', authToken)
        .send(updateData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already in use');
    });

    test('should require authentication for profile updates', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  describe('Password Updates', () => {
    test('should update password successfully', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'NewPassword456!'
      };

      const response = await request(app)
        .put('/api/user/password')
        .set('Cookie', authToken)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password updated successfully');

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: passwordData.newPassword
        });

      expect(loginResponse.status).toBe(200);
    });

    test('should reject password update with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'NewPassword456!'
      };

      const response = await request(app)
        .put('/api/user/password')
        .set('Cookie', authToken)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid current password');
    });

    test('should reject password update with mismatched confirmation', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'DifferentPassword789!'
      };

      const response = await request(app)
        .put('/api/user/password')
        .set('Cookie', authToken)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    test('should reject weak new password', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'weak',
        confirmPassword: 'weak'
      };

      const response = await request(app)
        .put('/api/user/password')
        .set('Cookie', authToken)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('Two-Factor Authentication', () => {
    test('should setup 2FA successfully', async () => {
      const response = await request(app)
        .post('/api/user/2fa/setup')
        .set('Cookie', authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.secret).toBeDefined();
      expect(response.body.data.qrCode).toBeDefined();
      expect(response.body.data.backupCodes).toBeDefined();
      expect(Array.isArray(response.body.data.backupCodes)).toBe(true);
    });

    test('should disable 2FA successfully', async () => {
      const response = await request(app)
        .delete('/api/user/2fa/disable')
        .set('Cookie', authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('2FA disabled successfully');
    });

    test('should require authentication for 2FA operations', async () => {
      const setupResponse = await request(app)
        .post('/api/user/2fa/setup');

      expect(setupResponse.status).toBe(401);

      const disableResponse = await request(app)
        .delete('/api/user/2fa/disable');

      expect(disableResponse.status).toBe(401);
    });
  });

  describe('Get Profile', () => {
    test('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Cookie', authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user.password).toBeUndefined(); // password should not be returned
    });

    test('should require authentication for profile access', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
    });
  });
});