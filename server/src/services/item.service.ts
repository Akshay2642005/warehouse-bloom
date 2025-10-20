import { prisma } from '../utils/prisma';
import { SearchService } from './search.service';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';
import { AlertService } from './alert.service';

export interface CreateItemData {
  name: string;
  sku: string;
  quantity: number;
  priceCents: number;
  imageUrl?: string;
  description?: string;
  ownerId: string;
}

export interface UpdateItemData {
  name?: string;
  sku?: string;
  quantity?: number;
  priceCents?: number;
  imageUrl?: string;
  description?: string;
}

export interface GetItemsParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Service for item management operations.
 */
export class ItemService {
  /**
   * Creates a new item with SKU uniqueness check and cache invalidation.
   */
  static async createItem(data: CreateItemData) {
    // Check SKU uniqueness with Redis cache
    const cacheKey = `sku:${data.sku}`;
    try {
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      if (cached) {
        throw new Error('SKU already exists');
      }
    } catch (error) {
      logger.warn('Redis check failed, falling back to DB', { error: error.message });
    }

    const existingItem = await prisma.item.findUnique({
      where: { sku: data.sku }
    });

    if (existingItem) {
      // Cache the SKU for future checks
      try {
        const redis = getRedis();
        await redis.setEx(cacheKey, 3600, 'exists');
      } catch (error) {
        logger.warn('Failed to cache SKU', { error: error.message });
      }
      throw new Error('SKU already exists');
    }

    const item = await prisma.item.create({
      data,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Cache the new SKU and invalidate search cache
    try {
      const redis = getRedis();
      await redis.setEx(cacheKey, 3600, 'exists');
      await SearchService.invalidateCache('items');
    } catch (error) {
      logger.warn('Failed to update cache after item creation', { error: error.message });
    }

    return item;
  }

  /**
   * Gets items with pagination and search using optimized search service.
   */
  static async getItems({ page, pageSize, search }: GetItemsParams) {
    return SearchService.searchItems({
      query: search,
      page,
      pageSize,
      filters: {}
    });
  }

  /**
   * Gets item by ID.
   */
  static async getItemById(id: string) {
    return prisma.item.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Updates item by ID with SKU uniqueness check and cache management.
   */
  static async updateItem(id: string, data: UpdateItemData) {
    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return null;
    }

    // Check SKU uniqueness if SKU is being updated
    if (data.sku && data.sku !== existingItem.sku) {
      const skuExists = await prisma.item.findUnique({
        where: { sku: data.sku }
      });

      if (skuExists) {
        throw new Error('SKU already exists');
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Update cache
    try {
      const redis = getRedis();
      if (data.sku && data.sku !== existingItem.sku) {
        // Remove old SKU from cache and add new one
        await redis.del(`sku:${existingItem.sku}`);
        await redis.setEx(`sku:${data.sku}`, 3600, 'exists');
      }
      await SearchService.invalidateCache('items');
    } catch (error) {
      logger.warn('Failed to update cache after item update', { error: error.message });
    }

    return updatedItem;
  }

  /**
   * Deletes item by ID with cache cleanup.
   */
  static async deleteItem(id: string) {
    try {
      const item = await prisma.item.findUnique({ where: { id } });
      if (!item) return false;

      await prisma.item.delete({ where: { id } });
      
      // Clean up cache
      try {
        const redis = getRedis();
        await redis.del(`sku:${item.sku}`);
        await SearchService.invalidateCache('items');
      } catch (error) {
        logger.warn('Failed to clean cache after item deletion', { error: error.message });
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Updates item quantity (for inventory management).
   */
  static async updateQuantity(id: string, quantity: number) {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    return prisma.item.update({
      where: { id },
      data: { quantity }
    });
  }

  /**
   * Gets low stock items (quantity < threshold).
   */
  static async getLowStockItems(threshold: number = 10) {
    return prisma.item.findMany({
      where: {
        quantity: {
          lt: threshold
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { quantity: 'asc' }
    });
  }

  /**
   * Restock item (add to existing quantity).
   */
  static async restockItem(id: string, amount: number) {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return null;

    const updatedItem = await prisma.item.update({
      where: { id },
      data: { quantity: item.quantity + amount },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Check for low stock alert after restocking
    await AlertService.createLowStockAlert(id, updatedItem.quantity);

    return updatedItem;
  }
}
