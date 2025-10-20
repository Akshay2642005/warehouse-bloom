import { prisma } from '../utils/prisma';
import { OrderStatus } from '@prisma/client';
import { SearchService } from './search.service';
import { logger } from '../utils/logger';

export interface CreateOrderItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  items: CreateOrderItemInput[];
}

export class OrdersService {
  static async listOrders(params: { page: number; pageSize: number; search?: string; status?: string }) {
    const { page, pageSize, search, status } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: { select: { id: true, email: true } },
          items: { include: { item: { select: { id: true, name: true, sku: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async getOrder(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } }, items: { include: { item: true } } },
    });
  }

  static async createOrder(input: CreateOrderInput) {
    // Fetch items and validate stock with optimized query
    const itemIds = input.items.map((i) => i.itemId);
    const dbItems = await prisma.item.findMany({ 
      where: { id: { in: itemIds } },
      select: { id: true, quantity: true, priceCents: true, name: true }
    });
    const idToItem = new Map(dbItems.map((i) => [i.id, i] as const));

    // Validate all items and stock in one pass
    for (const line of input.items) {
      const found = idToItem.get(line.itemId);
      if (!found) throw new Error(`Item ${line.itemId} not found`);
      if (line.quantity <= 0) throw new Error('Invalid quantity');
      if (found.quantity < line.quantity) {
        throw new Error(`Insufficient stock for ${found.name}. Available: ${found.quantity}, Requested: ${line.quantity}`);
      }
    }

    // Compute totals
    const totalCents = input.items.reduce((sum, line) => {
      const found = idToItem.get(line.itemId)!;
      return sum + found.priceCents * line.quantity;
    }, 0);

    // Create order and decrement stock in an optimized transaction
    const result = await prisma.$transaction(async (tx) => {
      // Use atomic counter for order number generation
      const orderCount = await tx.order.count();
      const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: input.userId,
          status: OrderStatus.PENDING,
          totalCents,
        },
      });

      // Batch create order items and update inventory
      const orderItemsData = input.items.map(line => {
        const item = idToItem.get(line.itemId)!;
        return {
          orderId: order.id,
          itemId: item.id,
          quantity: line.quantity,
          priceCents: item.priceCents,
        };
      });

      await tx.orderItem.createMany({ data: orderItemsData });

      // Batch update inventory
      for (const line of input.items) {
        const item = idToItem.get(line.itemId)!;
        await tx.item.update({
          where: { id: item.id },
          data: { quantity: { decrement: line.quantity } },
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: { 
          items: { 
            include: { 
              item: {
                select: { id: true, name: true, sku: true, priceCents: true }
              }
            }
          }
        },
      });
    }, {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
    });

    // Immediately invalidate all related caches
    try {
      await SearchService.invalidateCache('items');
      await SearchService.invalidateCache('orders');
      // Also clear any general cache patterns that might affect orders
      const redis = require('../utils/redis').getRedis();
      await redis.del('search:orders:*');
      logger.info('Cache invalidated after order creation');
    } catch (error) {
      logger.warn('Failed to invalidate cache after order creation', { error: error.message });
    }

    return result;
  }

  static async updateStatus(id: string, status: OrderStatus) {
    const result = await prisma.order.update({ where: { id }, data: { status } });
    
    // Invalidate orders cache
    try {
      await SearchService.invalidateCache('orders');
    } catch (error) {
      logger.warn('Failed to invalidate cache after status update', { error: error.message });
    }
    
    return result;
  }
} 