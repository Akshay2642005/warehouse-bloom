import { Request, Response, NextFunction } from 'express';

/**
 * 404 Not Found handler.
 */
export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({ message: 'Route not found' });
} 