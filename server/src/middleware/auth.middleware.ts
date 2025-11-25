import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  session?: {
    id: string;
    userId: string;
  };
}

/**
 * Middleware to verify user is authenticated via better-auth session
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      res.status(401).json({ success: false, message: 'Unauthorized - Please log in' });
      return;
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid session' });
  }
}

/**
 * Optional auth - sets user if authenticated but doesn't require it
 */
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (session) {
      req.user = session.user;
      req.session = session.session;
    }

    next();
  } catch (error) {
    next();
  }
}
