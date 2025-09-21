import bcrypt from 'bcrypt';
import { config } from './config';

/**
 * Hashes a plaintext password using bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  // In real usage, configure salt rounds via env
  const rounds = config.BCRYPT_ROUNDS || 5;
  return bcrypt.hash(plain, rounds);
}

/**
 * Compares a plaintext password with a bcrypt hash.
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
} 
