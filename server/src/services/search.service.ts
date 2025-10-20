import { safeRedisGet, safeRedisSet, safeRedisDel } from '../utils/redis';
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
  private static readonly CACHE_TTL = 0; // Disabled for debugging
  private static readonly MAX_PAGE_SIZE = 50;

  /**
   * Search items with full-text search, caching, and pagination
   */
  static async searchItems(params: SearchParams): Promise<SearchResult<any>> {
    const { query, page, pageSize: requestedPageSize, filters = {} } = params;
    const pageSize = Math.min(requestedPageSize, this.MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    // Generate cache key
    const cacheKey = `search:items:${Buffer.from(JSON.stringify({ query: query?.trim(), page, pageSize, filters })).toString('base64')}`;
    
    // Temporarily disable cache to ensure fresh data
    // const cached = await safeRedisGet(cacheKey);
    // if (cached) {
    //   logger.info('Cache hit for search', { cacheKey: cacheKey.substring(0, 50) });
    //   return JSON.parse(cached);
    // }

    // Build optimized where clause
    const where: any = {};
    
    if (query && query.trim()) {
      // Use case-insensitive contains search
      where.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { sku: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } }
      ];
    }

    // Apply filters
    if (filters.status) {
      switch (filters.status) {
        case 'in-stock':
          where.quantity = { gt: 10 };
          break;
        case 'low-stock':
          where.quantity = { gte: 1, lte: 10 };
          break;
        case 'out-of-stock':
          where.quantity = 0;
          break;
      }
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    logger.info('Executing search query', { where, page, pageSize });
    
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
          { name: 'asc' }
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

    // Cache result (disabled for debugging)
    if (this.CACHE_TTL > 0) {
      await safeRedisSet(cacheKey, JSON.stringify(result), this.CACHE_TTL);
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
    
    const cached = await safeRedisGet(cacheKey);
    if (cached) return JSON.parse(cached);

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

    await safeRedisSet(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    return result;
  }

  /**
   * Invalidate cache for specific entity type
   */
  static async invalidateCache(entityType: 'items' | 'orders' | 'all') {
    // For simplicity, we'll just let cache expire naturally
    // In production, you might want to implement pattern-based deletion
    logger.info(`Cache invalidation requested for ${entityType}`);
  }
}