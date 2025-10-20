import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { config } from './config';

export interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

/**
 * Signs a JWT with the provided payload and returns the token string.
 */
export function signToken(payload: JwtPayload): string {
  const secret: Secret = process.env.JWT_SECRET ?? 'dev_secret';

  const envExpires = config.JWT_EXPIRES_IN;
  const expiresIn: SignOptions['expiresIn'] = envExpires
    ? Number.isNaN(Number(envExpires))
      ? (envExpires as SignOptions['expiresIn']) // e.g. '1d', '2h'
      : Number(envExpires)
    : '1d';

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifies a JWT and returns its payload.
 */
export function verifyToken(token: string): JwtPayload {
  const secret: Secret = config.JWT_SECRET!;
  return jwt.verify(token, secret) as JwtPayload;
}
