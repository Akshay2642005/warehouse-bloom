import { prisma } from '../utils/prisma';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';

export interface SearchOptions {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  tenantId?: string;
  filters?: {
    categoryId?: string;
    supplierId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    lowStock?: boolean;
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Enhanced search service with full-text search and caching
 */
export class SearchService {
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly MAX_PAGE_SIZE = 100;

  /**
   * Search items with full-text search and advanced filtering
   */
  static async searchItems(options: SearchOptions): Promise<SearchResult<any>> {
    const {
      query = '',
      page = 1,
      pageSize = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      tenantId,
      filters = {}
    } = options;

    // Validate and sanitize inputs
    const validatedPage = Math.max(1, page);
    const validatedPageSize = Math.min(Math.max(1, pageSize), this.MAX_PAGE_SIZE);
    const offset = (validatedPage - 1) * validatedPageSize;

    // Generate cache key
    const cacheKey = `search:items:${JSON.stringify({
      query,
      page: validatedPage,
      pageSize: validatedPageSize,
      sortBy,
      sortOrder,
      filters
    })}`;

    try {
      // Try to get from cache first
      const redis = getRedis();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Search cache hit', { cacheKey });
          return JSON.parse(cached);
        }
      }

      // Build where clause
      const where: any = {
        isActive: true,
        ...(tenantId && { tenantId }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.supplierId && { supplierId: filters.supplierId }),
        ...(filters.minPrice && { priceCents: { gte: filters.minPrice } }),
        ...(filters.maxPrice && { 
          priceCents: { 
            ...(filters.minPrice ? { gte: filters.minPrice } : {}),
            lte: filters.maxPrice 
          } 
        }),
        ...(filters.inStock && { quantity: { gt: 0 } }),
        ...(filters.lowStock && { 
          quantity: { 
            gt: 0,
            lte: prisma.$queryRaw`reorder_level` 
          } 
        })
      };

      // Add full-text search if query provided
      if (query.trim()) {
        // Use PostgreSQL full-text search for better performance
        where.OR = [
          {
            name: {
              search: query.trim(),
              mode: 'insensitive'
            }
          },
          {
            description: {
              search: query.trim(),
              mode: 'insensitive'
            }
          },
          {
            sku: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          }
        ];
      }

      // Build order by clause
      const orderBy: any = {};
      if (sortBy === 'name' || sortBy === 'sku' || sortBy === 'quantity' || 
          sortBy === 'priceCents' || sortBy === 'updatedAt' || sortBy === 'createdAt') {
        orderBy[sortBy] = sortOrder;
      } else {
        orderBy.updatedAt = 'desc';
      }

      // Execute search with optimized includes
      const [items, total] = await Promise.all([
        prisma.item.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true }
            },
            supplier: {
              select: { id: true, name: true }
            },
            owner: {
              select: { id: true, name: true, email: true }
            },
            _count: {
              select: { orderItems: true }
            }
          },
          orderBy,
          skip: offset,
          take: validatedPageSize
        }),
        prisma.item.count({ where })
      ]);

      const totalPages = Math.ceil(total / validatedPageSize);
      const result: SearchResult<any> = {
        items,
        total,
        page: validatedPage,
        pageSize: validatedPageSize,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1
      };

      // Cache the result
      if (redis) {
        await redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(result));
        logger.debug('Search result cached', { cacheKey });
      }

      logger.info('Search completed', {
        query,
        total,
        page: validatedPage,
        pageSize: validatedPageSize,
        duration: 'tracked_by_middleware'
      });

      return result;

    } catch (error) {
      logger.error('Search failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        options
      });
      throw error;
    }
  }

  /**
   * Search orders with advanced filtering
   */
  static async searchOrders(options: SearchOptions): Promise<SearchResult<any>> {
    const {
      query = '',
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters = {}
    } = options;

    const validatedPage = Math.max(1, page);
    const validatedPageSize = Math.min(Math.max(1, pageSize), this.MAX_PAGE_SIZE);
    const offset = (validatedPage - 1) * validatedPageSize;

    try {
      const where: any = {
        ...(query.trim() && {
          OR: [
            { orderNumber: { contains: query.trim(), mode: 'insensitive' } },
            { user: { name: { contains: query.trim(), mode: 'insensitive' } } },
            { user: { email: { contains: query.trim(), mode: 'insensitive' } } }
          ]
        }),
        ...(filters.supplierId && { supplierId: filters.supplierId })
      };

      const orderBy: any = {};
      if (sortBy === 'orderNumber' || sortBy === 'status' || sortBy === 'totalCents' || 
          sortBy === 'createdAt' || sortBy === 'updatedAt') {
        orderBy[sortBy] = sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            supplier: {
              select: { id: true, name: true }
            },
            items: {
              include: {
                item: {
                  select: { id: true, name: true, sku: true }
                }
              }
            },
            payments: {
              select: { id: true, status: true, amount: true }
            },
            _count: {
              select: { items: true, shipments: true }
            }
          },
          orderBy,
          skip: offset,
          take: validatedPageSize
        }),
        prisma.order.count({ where })
      ]);

      const totalPages = Math.ceil(total / validatedPageSize);
      return {
        items: orders,
        total,
        page: validatedPage,
        pageSize: validatedPageSize,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1
      };

    } catch (error) {
      logger.error('Order search failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        options
      });
      throw error;
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query.trim() || query.length < 2) return [];

    const cacheKey = `suggestions:${query.trim().toLowerCase()}`;

    try {
      const redis = getRedis();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Get suggestions from item names and SKUs
      const suggestions = await prisma.item.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query.trim(), mode: 'insensitive' } },
            { sku: { contains: query.trim(), mode: 'insensitive' } }
          ]
        },
        select: {
          name: true,
          sku: true
        },
        take: limit * 2 // Get more to filter duplicates
      });

      // Extract unique suggestions
      const uniqueSuggestions = Array.from(new Set([
        ...suggestions.map(s => s.name),
        ...suggestions.map(s => s.sku)
      ]))
        .filter(s => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);

      // Cache suggestions
      if (redis) {
        await redis.setEx(cacheKey, 300, JSON.stringify(uniqueSuggestions)); // 5 minutes
      }

      return uniqueSuggestions;

    } catch (error) {
      logger.error('Failed to get search suggestions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query
      });
      return [];
    }
  }

  /**
   * Invalidate search cache
   */
  static async invalidateCache(type: 'items' | 'orders' | 'all' = 'all'): Promise<void> {
    try {
      const redis = getRedis();
      if (!redis) return;

      const patterns = [];
      if (type === 'items' || type === 'all') {
        patterns.push('search:items:*', 'suggestions:*');
      }
      if (type === 'orders' || type === 'all') {
        patterns.push('search:orders:*');
      }

      for (const pattern of patterns) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }

      logger.debug('Search cache invalidated', { type, patterns });

    } catch (error) {
      logger.error('Failed to invalidate search cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type
      });
    }
  }

  /**
   * Get popular search terms
   */
  static async getPopularSearches(limit: number = 10): Promise<Array<{ term: string; count: number }>> {
    const cacheKey = 'popular_searches';

    try {
      const redis = getRedis();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // This would typically come from search analytics
      // For now, return most common item names
      const popularItems = await prisma.item.findMany({
        where: { isActive: true },
        select: { name: true },
        orderBy: { updatedAt: 'desc' },
        take: limit
      });

      const result = popularItems.map((item, index) => ({
        term: item.name,
        count: limit - index // Mock count
      }));

      if (redis) {
        await redis.setEx(cacheKey, 3600, JSON.stringify(result)); // 1 hour
      }

      return result;

    } catch (error) {
      logger.error('Failed to get popular searches', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }
}