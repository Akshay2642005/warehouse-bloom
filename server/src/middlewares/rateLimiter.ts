import rateLimit from 'express-rate-limit';

/**
 * Creates a rate limiter middleware instance with sensible defaults.
 */
export function createRateLimiter(options?: { windowMs?: number; max?: number }) {
  return rateLimit({
    windowMs: options?.windowMs ?? (15 * 60 * 1000),
    max: options?.max ?? 100,
    standardHeaders: true,
    legacyHeaders: false
  });
} 