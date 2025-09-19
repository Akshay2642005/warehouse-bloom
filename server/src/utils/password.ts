import bcrypt from 'bcrypt';

/**
 * Hashes a plaintext password using bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  // In real usage, configure salt rounds via env
  const rounds = 10;
  return bcrypt.hash(plain, rounds);
}

/**
 * Compares a plaintext password with a bcrypt hash.
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
} 