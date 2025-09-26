import { NextFunction, Request, Response } from 'express';
import { createResponse } from '../utils/apiResponse';

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json(createResponse({
      success: false,
      message: 'Authentication required'
    }));
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json(createResponse({
      success: false,
      message: 'Admin access required'
    }));
    return;
  }

  next();
}
