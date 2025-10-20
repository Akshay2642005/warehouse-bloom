import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { createResponse } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';
import { getRedis } from '../utils/redis';

export const statusRouter = Router();

/**
 * Get system status and health check
 */
statusRouter.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    // Check Redis connection
    const redisStart = Date.now();
    const redis = getRedis();
    let redisLatency = 0;
    let redisStatus: 'connected' | 'disconnected' = 'disconnected';
    if (redis) {
      try {
        await redis.ping();
        redisStatus = 'connected';
      } catch {
        // leave disconnected
      }
      redisLatency = Date.now() - redisStart;
    }

    // Get basic stats
    const [userCount, itemCount] = await Promise.all([
      prisma.user.count(),
      prisma.item.count()
    ]);

    const totalLatency = Date.now() - startTime;

    res.json(createResponse({
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: {
            status: 'connected',
            latency: `${dbLatency}ms`
          },
          redis: {
            status: redisStatus,
            latency: `${redisLatency}ms`
          }
        },
        stats: {
          totalUsers: userCount,
          totalItems: itemCount
        },
        responseTime: `${totalLatency}ms`
      },
      message: 'System status retrieved successfully'
    }));
  } catch (error) {
    res.status(503).json(createResponse({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      message: 'System health check failed'
    }));
  }
});

/**
 * Get detailed system metrics (protected)
 */
statusRouter.get('/metrics', requireAuth, async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    
    // Get database stats
    const [
      userStats,
      itemStats,
      lowStockCount
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.item.aggregate({
        _count: true,
        _sum: { quantity: true, priceCents: true },
        _avg: { quantity: true, priceCents: true }
      }),
      prisma.item.count({
        where: { quantity: { lt: 10 } }
      })
    ]);

    res.json(createResponse({
      data: {
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime(),
          memory: {
            used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
          }
        },
        database: {
          users: {
            total: userStats.reduce((sum, stat) => sum + stat._count.role, 0),
            byRole: userStats.reduce((acc, stat) => {
              acc[stat.role] = stat._count.role;
              return acc;
            }, {} as Record<string, number>)
          },
          items: {
            total: itemStats._count,
            totalQuantity: itemStats._sum.quantity || 0,
            totalValue: itemStats._sum.priceCents || 0,
            averageQuantity: Math.round(itemStats._avg.quantity || 0),
            averagePrice: Math.round(itemStats._avg.priceCents || 0),
            lowStockItems: lowStockCount
          }
        }
      },
      message: 'System metrics retrieved successfully'
    }));
  } catch (error) {
    res.status(500).json(createResponse({
      success: false,
      message: 'Failed to retrieve system metrics'
    }));
  }
});