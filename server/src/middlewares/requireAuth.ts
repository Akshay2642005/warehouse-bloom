import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { createResponse } from '../utils/apiResponse';

/**
 * Requires a valid authentication token to access the route.
 * Verifies JWT and attaches user payload to req.user.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (!token) {
      res.status(401).json(createResponse({ 
        success: false, 
        message: 'Access token required' 
      }));
      return;
    }

    // Verify JWT
    const payload = verifyToken(token);
    
    // Attach payload to req.user
    req.user = payload;
    
    next();
  } catch (error) {
    res.status(401).json(createResponse({ 
      success: false, 
      message: 'Invalid or expired token' 
    }));
  }
} 