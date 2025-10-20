import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';
import { getRedis } from '../utils/redis';

/**
 * Enhanced rate limiting with Redis store
 */
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || config.RATE_LIMIT_WINDOW_MS,
    max: options.max || config.RATE_LIMIT_MAX_REQUESTS,
    message: options.message || 'Too many requests from this IP',
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    standardHeaders: true,
    legacyHeaders: false,
    store: getRedis() ? undefined : undefined, // Use memory store if Redis unavailable
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      res.status(429).json({
        error: 'Too many requests',
        message: options.message || 'Please try again later',
        retryAfter: Math.ceil(options.windowMs! / 1000)
      });
    }
  });
};

/**
 * Login attempt tracking and account lockout
 */
export const loginAttemptTracker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return next();

    const redis = getRedis();
    const lockoutKey = `lockout:${email}`;
    const attemptsKey = `attempts:${email}`;

    // Check if account is locked
    if (redis) {
      const lockoutTime = await redis.get(lockoutKey);
      if (lockoutTime) {
        const remainingTime = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000 / 60);
        return res.status(423).json({
          error: 'Account locked',
          message: `Account is locked due to too many failed login attempts. Try again in ${remainingTime} minutes.`,
          lockedUntil: new Date(parseInt(lockoutTime))
        });
      }
    }

    // Track this attempt
    req.loginAttempt = { email, attemptsKey, lockoutKey };
    next();
  } catch (error) {
    logger.error('Login attempt tracker error', { error });
    next();
  }
};

/**
 * Handle failed login attempts
 */
export const handleFailedLogin = async (email: string, attemptsKey: string, lockoutKey: string) => {
  try {
    const redis = getRedis();
    if (!redis) return;

    const attempts = await redis.incr(attemptsKey);
    await redis.expire(attemptsKey, config.LOCKOUT_DURATION_MINUTES * 60);

    if (attempts >= config.MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + (config.LOCKOUT_DURATION_MINUTES * 60 * 1000);
      await redis.setEx(lockoutKey, config.LOCKOUT_DURATION_MINUTES * 60, lockoutUntil.toString());
      await redis.del(attemptsKey);

      logger.warn('Account locked due to failed login attempts', {
        email,
        attempts,
        lockoutUntil: new Date(lockoutUntil)
      });
    }
  } catch (error) {
    logger.error('Failed to handle login attempt', { error, email });
  }
};

/**
 * Clear login attempts on successful login
 */
export const clearLoginAttempts = async (email: string) => {
  try {
    const redis = getRedis();
    if (!redis) return;

    await redis.del(`attempts:${email}`);
    await redis.del(`lockout:${email}`);
  } catch (error) {
    logger.error('Failed to clear login attempts', { error, email });
  }
};

/**
 * IP whitelist middleware
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (config.isProduction && allowedIPs.length > 0 && !allowedIPs.includes(clientIP!)) {
      logger.warn('Blocked request from non-whitelisted IP', { ip: clientIP });
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};

/**
 * Request sanitization middleware
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove potentially dangerous characters from query params
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = (req.query[key] as string)
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();
    }
  }

  // Limit request body size
  const contentLength = parseInt(req.get('content-length') || '0');
  if (contentLength > config.MAX_FILE_SIZE_MB * 1024 * 1024) {
    return res.status(413).json({ error: 'Request too large' });
  }

  next();
};

/**
 * Session validation middleware
 */
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next();

    // Check if session exists and is valid
    const session = await prisma.userSession.findFirst({
      where: {
        userId: req.user.id,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActivity: 'desc' }
    });

    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Update last activity
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivity: new Date() }
    });

    next();
  } catch (error) {
    logger.error('Session validation error', { error });
    next();
  }
};

/**
 * Audit logging middleware
 */
export const auditLogger = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseBody: any;

    res.send = function(body) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      try {
        if (req.user && res.statusCode < 400) {
          await prisma.auditLog.create({
            data: {
              userId: req.user.id,
              action,
              resource,
              resourceId: req.params.id || null,
              oldValues: req.method === 'PUT' || req.method === 'PATCH' ? req.body : null,
              newValues: res.statusCode >= 200 && res.statusCode < 300 ? responseBody : null,
              ipAddress: req.ip,
              userAgent: req.get('User-Agent') || null
            }
          });
        }
      } catch (error) {
        logger.error('Audit logging failed', { error });
      }
    });

    next();
  };
};

// Rate limiters for different endpoints
export const rateLimiters = {
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.isDevelopment ? 100 : 5, // Relaxed for development
    message: 'Too many authentication attempts'
  }),
  
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many API requests'
  }),
  
  search: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many search requests'
  }),
  
  heavy: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many resource-intensive requests'
  })
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      loginAttempt?: {
        email: string;
        attemptsKey: string;
        lockoutKey: string;
      };
    }
  }
}