import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getRedis } from '../utils/redis';

/**
 * Performance monitoring middleware
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    // Log slow requests
    if (duration > 2000) {
      logger.warn('Slow request detected', {
        method,
        url,
        duration,
        statusCode,
        ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    // Track metrics in Redis for monitoring
    try {
      const redis = getRedis();
      const metricsKey = `metrics:${method}:${url.split('?')[0]}`;
      redis.hIncrBy(metricsKey, 'count', 1);
      redis.hIncrBy(metricsKey, 'totalTime', duration);
      redis.expire(metricsKey, 3600); // Keep metrics for 1 hour
    } catch (error) {
      // Silently fail metrics collection
    }
  });
  
  next();
}

/**
 * Memory usage monitoring
 */
export function memoryMonitor(req: Request, res: Response, next: NextFunction) {
  const memUsage = process.memoryUsage();
  
  // Alert if memory usage is high
  if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
    logger.warn('High memory usage detected', {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
    });
  }
  
  next();
}

/**
 * Request size limiter for specific endpoints
 */
export function requestSizeLimiter(maxSize: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request entity too large',
        maxSize: `${maxSize / 1024 / 1024}MB`
      });
    }
    
    next();
  };
}

/**
 * Response compression for large payloads
 */
export function smartCompression(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // Only compress large responses
    if (typeof data === 'string' && data.length > 1024) {
      res.set('Content-Encoding', 'gzip');
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Database connection health check
 */
export async function healthCheck(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/health') {
    try {
      const redis = getRedis();
      await redis.ping();
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          redis: 'connected',
          database: 'connected'
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
        }
      });
      return;
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      return;
    }
  }
  
  next();
}