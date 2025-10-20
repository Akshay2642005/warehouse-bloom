import { prisma } from '../../src/utils/prisma';
import bcrypt from 'bcrypt';

interface CreateUserOpts { email?: string; password?: string; role?: 'admin' | 'user'; name?: string; twoFactorEnabled?: boolean; }

export async function createTestUser(opts: CreateUserOpts = {}) {
  const email = opts.email || `user_${Date.now()}_${Math.random().toString(16).slice(2)}@test.com`;
  const password = opts.password || 'Password123!';
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, password: hashed, role: (opts.role ?? 'admin'), name: opts.name || 'Test User', twoFactorEnabled: opts.twoFactorEnabled || false } });
}

export const DEFAULT_TEST_PASSWORD = 'Password123!';
