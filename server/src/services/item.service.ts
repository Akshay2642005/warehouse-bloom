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
  costCents?: number;
  imageUrl?: string;
  description?: string;
  ownerId: string;
  tenantId?: string;
  categoryId?: string;
  supplierId?: string;
  reorderLevel?: number;
  minStock?: number;
  maxStock?: number;
  weight?: number;
  dimensions?: any;
  barcode?: string;
  location?: string;
}

export interface UpdateItemData {
  name?: string;
  sku?: string;
  quantity?: number;
  priceCents?: number;
  costCents?: number;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
  supplierId?: string;
  reorderLevel?: number;
  minStock?: number;
  maxStock?: number;
  weight?: number;
  dimensions?: any;
  barcode?: string;
  location?: string;
  isActive?: boolean;
}

export interface GetItemsParams {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
}

export interface BulkUpdateData {
  ids: string[];
  data: Partial<UpdateItemData>;
}

/**
 * Enhanced service for item management operations with optimizations.
 */
export class ItemService {
  /**
   * Creates a new item with comprehensive validation and optimizations.
   */
  static async createItem(data: CreateItemData) {
    // Validate SKU and barcode uniqueness
    await this.validateUniqueness(data.sku, data.barcode);

    // Validate business rules
    this.validateItemData(data);

    const item = await prisma.item.create({
      data: {
        ...data,
        reorderLevel: data.reorderLevel || 10,
        minStock: data.minStock || 5,
        maxStock: data.maxStock || 1000
      },
      include: {
        owner: {
          select: { id: true, email: true, name: true, role: true }
        },
        category: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true }
        }
      }
    });

    // Cache SKU and barcode, invalidate search cache
    await this.updateCacheAfterCreate(item);

    // Create inventory log
    if (data.quantity > 0) {
      await this.createInventoryLog(item.id, data.quantity, 'Initial stock');
    }

    // Check for low stock alert
    await AlertService.createLowStockAlert(item.id, item.quantity);

    logger.business('Item created', {
      itemId: item.id,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      ownerId: data.ownerId
    });

    return item;
  }

  /**
   * Gets items with advanced filtering and search.
   */
  static async getItems(params: GetItemsParams) {
    const { page, pageSize, search, categoryId, supplierId, lowStock, outOfStock } = params;
    
    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId;
    if (supplierId) filters.supplierId = supplierId;
    if (lowStock) filters.lowStock = true;
    if (outOfStock) filters.inStock = false;

    return SearchService.searchItems({
      query: search,
      page,
      pageSize,
      filters
    });
  }

  /**
   * Gets item by ID with comprehensive data.
   */
  static async getItemById(id: string, tenantId?: string) {
    const cacheKey = `item:${id}`;
    
    try {
      const redis = getRedis();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      logger.warn('Cache read failed', { error: error instanceof Error ? error.message : 'unknown' });
    }

    const where: any = { id, isActive: true };
    if (tenantId) where.tenantId = tenantId;
    
    const item = await prisma.item.findFirst({
      where,
      include: {
        owner: {
          select: { id: true, email: true, name: true, role: true }
        },
        category: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true, email: true, phone: true }
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            delta: true,
            reason: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            orderItems: true,
            alerts: true
          }
        }
      }
    });

    if (item) {
      try {
        const redis = getRedis();
        if (redis) {
          await redis.setEx(cacheKey, 300, JSON.stringify(item)); // 5 minutes
        }
      } catch (error) {
        logger.warn('Cache write failed', { error: error instanceof Error ? error.message : 'unknown' });
      }
    }

    return item;
  }

  /**
   * Updates item with comprehensive validation and audit logging.
   */
  static async updateItem(id: string, data: UpdateItemData, tenantId?: string) {
    const where: any = { id, isActive: true };
    if (tenantId) where.tenantId = tenantId;
    
    const existingItem = await prisma.item.findUnique({
      where
    });

    if (!existingItem) {
      return null;
    }

    // Validate uniqueness if SKU or barcode changed
    if ((data.sku && data.sku !== existingItem.sku) || 
        (data.barcode && data.barcode !== existingItem.barcode)) {
      await this.validateUniqueness(data.sku, data.barcode, id);
    }

    // Validate business rules
    this.validateItemData(data);

    // Track quantity changes for inventory log
    const quantityDelta = data.quantity !== undefined ? data.quantity - existingItem.quantity : 0;

    const updatedItem = await prisma.item.update({
      where: { id },
      data,
      include: {
        owner: {
          select: { id: true, email: true, name: true, role: true }
        },
        category: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true }
        }
      }
    });

    // Create inventory log for quantity changes
    if (quantityDelta !== 0) {
      await this.createInventoryLog(
        id, 
        quantityDelta, 
        quantityDelta > 0 ? 'Stock increase' : 'Stock decrease'
      );
    }

    // Update cache
    await this.updateCacheAfterUpdate(existingItem, updatedItem);

    // Check for alerts
    if (data.quantity !== undefined) {
      await AlertService.createLowStockAlert(id, updatedItem.quantity);
    }

    logger.business('Item updated', {
      itemId: id,
      changes: Object.keys(data),
      quantityDelta
    });

    return updatedItem;
  }

  /**
   * Soft deletes item (marks as inactive).
   */
  static async deleteItem(id: string, tenantId?: string) {
    try {
      const where: any = { id, isActive: true };
      if (tenantId) where.tenantId = tenantId;
      
      const item = await prisma.item.findUnique({ 
        where,
        include: {
          orderItems: {
            include: {
              order: {
                select: { status: true }
              }
            }
          }
        }
      });
      
      if (!item) return false;

      // Check if item has pending orders
      const hasPendingOrders = item.orderItems.some(
        oi => oi.order.status === 'PENDING' || oi.order.status === 'PROCESSING'
      );

      if (hasPendingOrders) {
        throw new Error('Cannot delete item with pending orders');
      }

      // Soft delete (mark as inactive)
      await prisma.item.update({
        where: { id },
        data: { isActive: false }
      });
      
      // Clean up cache
      await this.cleanupCacheAfterDelete(item);

      logger.business('Item deleted', {
        itemId: id,
        sku: item.sku,
        name: item.name
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to delete item', {
        error: error instanceof Error ? error.message : 'unknown',
        itemId: id
      });
      throw error;
    }
  }

  /**
   * Updates item quantity with inventory tracking.
   */
  static async updateQuantity(id: string, quantity: number, reason: string = 'Manual adjustment') {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      throw new Error('Item not found');
    }

    const delta = quantity - existingItem.quantity;
    
    const updatedItem = await prisma.item.update({
      where: { id },
      data: { quantity },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create inventory log
    await this.createInventoryLog(id, delta, reason);

    // Check for alerts
    await AlertService.createLowStockAlert(id, quantity);

    // Invalidate cache
    await this.invalidateItemCache(id);

    logger.business('Quantity updated', {
      itemId: id,
      oldQuantity: existingItem.quantity,
      newQuantity: quantity,
      delta,
      reason
    });

    return updatedItem;
  }

  /**
   * Gets low stock items with enhanced filtering.
   */
  static async getLowStockItems(threshold: number = 10, tenantId?: string) {
    const where: any = {
      isActive: true,
      quantity: { lt: threshold }
    };
    
    if (tenantId) where.tenantId = tenantId;

    return prisma.item.findMany({
      where,
      include: {
        owner: {
          select: { id: true, email: true, name: true, role: true }
        },
        category: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true }
        }
      },
      orderBy: [{ quantity: 'asc' }]
    });
  }

  /**
   * Restock item with comprehensive tracking.
   */
  static async restockItem(id: string, amount: number, tenantId?: string, reason: string = 'Restock') {
    if (amount <= 0) {
      throw new Error('Restock amount must be positive');
    }

    const where: any = { id, isActive: true };
    if (tenantId) where.tenantId = tenantId;
    
    const item = await prisma.item.findUnique({ 
      where,
      include: {
        supplier: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!item) {
      throw new Error('Item not found');
    }

    const newQuantity = item.quantity + amount;
    
    const updatedItem = await prisma.item.update({
      where: { id },
      data: { quantity: newQuantity },
      include: {
        owner: {
          select: { id: true, email: true, name: true, role: true }
        },
        category: {
          select: { id: true, name: true }
        },
        supplier: {
          select: { id: true, name: true }
        }
      }
    });

    // Create inventory log
    await this.createInventoryLog(id, amount, reason);

    // Check for alerts
    await AlertService.createLowStockAlert(id, newQuantity);

    // Invalidate cache
    await this.invalidateItemCache(id);

    logger.business('Item restocked', {
      itemId: id,
      amount,
      oldQuantity: item.quantity,
      newQuantity,
      reason
    });

    return updatedItem;
  }

  /**
   * Bulk update items.
   */
  static async bulkUpdateItems(data: BulkUpdateData) {
    const { ids, data: updateData } = data;
    
    if (ids.length === 0) {
      throw new Error('No items selected for update');
    }

    if (ids.length > 100) {
      throw new Error('Cannot update more than 100 items at once');
    }

    // Validate items exist and are active
    const existingItems = await prisma.item.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true, sku: true, name: true }
    });

    if (existingItems.length !== ids.length) {
      throw new Error('Some items not found or inactive');
    }

    // Perform bulk update
    const result = await prisma.item.updateMany({
      where: { id: { in: ids } },
      data: updateData
    });

    // Invalidate cache for all updated items
    await Promise.all(ids.map(id => this.invalidateItemCache(id)));
    await SearchService.invalidateCache('items');

    logger.business('Bulk items updated', {
      itemCount: ids.length,
      changes: Object.keys(updateData)
    });

    return result;
  }

  /**
   * Get item analytics.
   */
  static async getItemAnalytics(startDate: Date, endDate: Date) {
    const [totalItems, activeItems, lowStockItems, outOfStockItems, topCategories] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({ where: { isActive: true } }),
      prisma.item.count({ 
        where: { 
          isActive: true,
          quantity: { lte: prisma.$queryRaw`reorder_level` }
        }
      }),
      prisma.item.count({ 
        where: { 
          isActive: true,
          quantity: 0
        }
      }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { items: true }
          }
        },
        orderBy: {
          items: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ]);

    return {
      totalItems,
      activeItems,
      lowStockItems,
      outOfStockItems,
      topCategories: topCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        itemCount: cat._count.items
      }))
    };
  }

  // Private helper methods
  private static async validateUniqueness(sku?: string, barcode?: string, excludeId?: string) {
    const where: any = {
      isActive: true,
      ...(excludeId && { id: { not: excludeId } })
    };

    if (sku || barcode) {
      where.OR = [];
      if (sku) where.OR.push({ sku });
      if (barcode) where.OR.push({ barcode });
    }

    if (sku || barcode) {
      const existing = await prisma.item.findFirst({ where });
      if (existing) {
        if (existing.sku === sku) throw new Error('SKU already exists');
        if (existing.barcode === barcode) throw new Error('Barcode already exists');
      }
    }
  }

  private static validateItemData(data: Partial<CreateItemData | UpdateItemData>) {
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    if (data.priceCents !== undefined && data.priceCents < 0) {
      throw new Error('Price cannot be negative');
    }
    if (data.costCents !== undefined && data.costCents < 0) {
      throw new Error('Cost cannot be negative');
    }
    if (data.reorderLevel !== undefined && data.reorderLevel < 0) {
      throw new Error('Reorder level cannot be negative');
    }
    if (data.minStock !== undefined && data.minStock < 0) {
      throw new Error('Minimum stock cannot be negative');
    }
    if (data.maxStock !== undefined && data.maxStock < 0) {
      throw new Error('Maximum stock cannot be negative');
    }
    if (data.minStock !== undefined && data.maxStock !== undefined && data.minStock > data.maxStock) {
      throw new Error('Minimum stock cannot be greater than maximum stock');
    }
  }

  private static async createInventoryLog(itemId: string, delta: number, reason: string, referenceId?: string) {
    try {
      await prisma.inventoryLog.create({
        data: {
          itemId,
          delta,
          reason,
          referenceId
        }
      });
    } catch (error) {
      logger.error('Failed to create inventory log', {
        error: error instanceof Error ? error.message : 'unknown',
        itemId,
        delta,
        reason
      });
    }
  }

  private static async updateCacheAfterCreate(item: any) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.setEx(`sku:${item.sku}`, 3600, 'exists');
        if (item.barcode) {
          await redis.setEx(`barcode:${item.barcode}`, 3600, 'exists');
        }
      }
      await SearchService.invalidateCache('items');
    } catch (error) {
      logger.warn('Failed to update cache after item creation', {
        error: error instanceof Error ? error.message : 'unknown'
      });
    }
  }

  private static async updateCacheAfterUpdate(oldItem: any, newItem: any) {
    try {
      const redis = getRedis();
      if (redis) {
        // Update SKU cache if changed
        if (oldItem.sku !== newItem.sku) {
          await redis.del(`sku:${oldItem.sku}`);
          await redis.setEx(`sku:${newItem.sku}`, 3600, 'exists');
        }
        
        // Update barcode cache if changed
        if (oldItem.barcode !== newItem.barcode) {
          if (oldItem.barcode) await redis.del(`barcode:${oldItem.barcode}`);
          if (newItem.barcode) await redis.setEx(`barcode:${newItem.barcode}`, 3600, 'exists');
        }
        
        // Invalidate item cache
        await redis.del(`item:${newItem.id}`);
      }
      await SearchService.invalidateCache('items');
    } catch (error) {
      logger.warn('Failed to update cache after item update', {
        error: error instanceof Error ? error.message : 'unknown'
      });
    }
  }

  private static async cleanupCacheAfterDelete(item: any) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.del(`sku:${item.sku}`);
        if (item.barcode) await redis.del(`barcode:${item.barcode}`);
        await redis.del(`item:${item.id}`);
      }
      await SearchService.invalidateCache('items');
    } catch (error) {
      logger.warn('Failed to cleanup cache after item deletion', {
        error: error instanceof Error ? error.message : 'unknown'
      });
    }
  }

  private static async invalidateItemCache(id: string) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.del(`item:${id}`);
      }
    } catch (error) {
      logger.warn('Failed to invalidate item cache', {
        error: error instanceof Error ? error.message : 'unknown',
        itemId: id
      });
    }
  }
}
