import { getRedis } from '../utils/redis';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  query?: string;
  page: number;
  pageSize: number;
  filters?: Record<string, any>;
}

/**
 * High-performance search service with Redis caching and optimized queries
 */
export class SearchService {
  private static readonly CACHE_TTL = 60; // 1 minute
  private static readonly MAX_PAGE_SIZE = 50;

  /**
   * Search items with full-text search, caching, and pagination
   */
  static async searchItems(params: SearchParams): Promise<SearchResult<any>> {
    const { query, page, pageSize: requestedPageSize, filters = {} } = params;
    const pageSize = Math.min(requestedPageSize, this.MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    // Generate cache key
    const cacheKey = `search:items:${JSON.stringify({ query, page, pageSize, filters })}`;
    
    try {
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info('Cache hit for search', { cacheKey });
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.warn('Redis cache miss', { error: error.message });
    }

    // Build optimized where clause
    const where: any = {};
    
    if (query) {
      // Use case-insensitive contains search
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Apply filters
    if (filters.status) {
      switch (filters.status) {
        case 'in-stock':
          where.quantity = { gt: 10 };
          break;
        case 'low-stock':
          where.quantity = { gt: 0, lte: 10 };
          break;
        case 'out-of-stock':
          where.quantity = 0;
          break;
      }
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    // Execute optimized query with minimal data transfer
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          priceCents: true,
          imageUrl: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: [
          { quantity: 'asc' }, // Show low stock first
          { updatedAt: 'desc' }
        ]
      }),
      prisma.item.count({ where })
    ]);

    const result: SearchResult<any> = {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };

    // Cache result
    try {
      const redis = getRedis();
      await redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(result));
    } catch (error) {
      logger.warn('Failed to cache search result', { error: error.message });
    }

    return result;
  }

  /**
   * Search orders with optimized queries
   */
  static async searchOrders(params: SearchParams): Promise<SearchResult<any>> {
    const { query, page, pageSize: requestedPageSize, filters = {} } = params;
    const pageSize = Math.min(requestedPageSize, this.MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const cacheKey = `search:orders:${JSON.stringify({ query, page, pageSize, filters })}`;
    
    try {
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (error) {
      logger.warn('Redis cache miss for orders', { error: error.message });
    }

    const where: any = {};
    
    if (query) {
      where.OR = [
        { orderNumber: { contains: query, mode: 'insensitive' } },
        { user: { email: { contains: query, mode: 'insensitive' } } }
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalCents: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true
            }
          },
          items: {
            select: {
              id: true,
              quantity: true,
              priceCents: true,
              item: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    const result: SearchResult<any> = {
      items: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };

    try {
      const redis = getRedis();
      await redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(result));
    } catch (error) {
      logger.warn('Failed to cache orders search result', { error: error.message });
    }

    return result;
  }

  /**
   * Invalidate cache for specific entity type
   */
  static async invalidateCache(entityType: 'items' | 'orders' | 'all') {
    try {
      const redis = getRedis();
      const pattern = entityType === 'all' ? 'search:*' : `search:${entityType}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.info(`Invalidated ${keys.length} cache keys for ${entityType}`);
      }
    } catch (error) {
      logger.warn('Failed to invalidate cache', { error: error.message });
    }
  }

  /**
   * Clear all cache (useful for debugging)
   */
  static async clearAllCache() {
    try {
      const redis = getRedis();
      await redis.flushall();
      logger.info('Cleared all Redis cache');
    } catch (error) {
      logger.warn('Failed to clear all cache', { error: error.message });
    }
  }
}