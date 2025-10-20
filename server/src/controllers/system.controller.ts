import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getRedis } from '../utils/redis';
import { createResponse } from '../utils/apiResponse';
import os from 'os';

export async function getSystemStatus(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    // Test Redis connection
    const redisStart = Date.now();
    let redisStatus = 'disconnected';
    let redisLatency = 0;
    try {
      const redis = getRedis();
      if (redis) {
        await redis.ping();
        redisStatus = 'connected';
      }
      redisLatency = Date.now() - redisStart;
    } catch (_err) {
      // Leave redisStatus as disconnected
      redisLatency = Date.now() - redisStart;
    }

    const responseTime = Date.now() - startTime;
    
    const status = {
      status: 'healthy' as const,
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: {
          status: 'connected' as const,
          latency: `${dbLatency}ms`
        },
        redis: {
          status: redisStatus as 'connected' | 'disconnected',
          latency: `${redisLatency}ms`
        }
      }
    };

    res.json(createResponse({ data: status }));
  } catch (error) {
    res.status(500).json(createResponse({
      success: false,
      message: 'System health check failed'
    }));
  }
}

export async function getSystemMetrics(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.tenantId;
    const whereClause = tenantId ? { tenantId } : {};
    
    const [
      userStats,
      itemStats,
      totalValue,
      lowStockCount
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        where: tenantId ? { tenantId } : {},
        _count: { role: true }
      }),
      prisma.item.aggregate({
        where: whereClause,
        _count: { id: true },
        _sum: { quantity: true, priceCents: true }
      }),
      prisma.item.aggregate({
        where: whereClause,
        _sum: { priceCents: true }
      }),
      prisma.item.count({ where: { ...whereClause, quantity: { lte: 10 } } })
    ]);

    const totalUsers = userStats.reduce((sum, stat) => sum + stat._count.role, 0);
    const usersByRole = userStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role;
      return acc;
    }, {} as Record<string, number>);

    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();

    const metrics = {
      system: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        uptime: process.uptime(),
        memory: {
          used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(totalMem / 1024 / 1024)}MB`
        }
      },
      database: {
        users: {
          total: totalUsers,
          byRole: usersByRole
        },
        items: {
          total: itemStats._count.id || 0,
          totalQuantity: itemStats._sum.quantity || 0,
          totalValue: totalValue._sum.priceCents || 0,
          lowStockItems: lowStockCount
        }
      }
    };

    res.json(createResponse({ data: metrics }));
  } catch (error) {
    res.status(500).json(createResponse({
      success: false,
      message: 'Failed to retrieve system metrics'
    }));
  }
}