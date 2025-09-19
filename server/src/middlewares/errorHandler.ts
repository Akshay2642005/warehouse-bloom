import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { createResponse } from '../utils/apiResponse';

/**
 * Express error handling middleware.
 * Formats errors into consistent JSON responses.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  logger.error('Unhandled error', { err });

  // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.reduce((acc, error) => {
      acc[error.path.join('.')] = error.message;
      return acc;
    }, {} as Record<string, string>);
    
    res.status(400).json(createResponse({
      success: false,
      message: 'Validation failed',
      errors
    }));
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(400).json(createResponse({
        success: false,
        message: 'Unique constraint violation'
      }));
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json(createResponse({
        success: false,
        message: 'Record not found'
      }));
      return;
    }
  }

  // Custom application errors
  if (err instanceof Error) {
    res.status(400).json(createResponse({
      success: false,
      message: err.message
    }));
    return;
  }

  // Default error
  res.status(500).json(createResponse({
    success: false,
    message: 'Internal Server Error'
  }));
} 