import { prisma } from '../utils/prisma';
import { OrderStatus } from '@prisma/client';

export interface CreateOrderItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  items: CreateOrderItemInput[];
}

export class OrdersService {
  static async listOrders(params: { page: number; pageSize: number }) {
    const { page, pageSize } = params;
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: pageSize,
        include: {
          user: { select: { id: true, email: true } },
          items: { include: { item: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count(),
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
    // Fetch items and validate stock
    const itemIds = input.items.map((i) => i.itemId);
    const dbItems = await prisma.item.findMany({ where: { id: { in: itemIds } } });
    const idToItem = new Map(dbItems.map((i) => [i.id, i] as const));

    for (const line of input.items) {
      const found = idToItem.get(line.itemId);
      if (!found) throw new Error('Item not found');
      if (line.quantity <= 0) throw new Error('Invalid quantity');
      if (found.quantity < line.quantity) throw new Error('Insufficient stock');
    }

    // Compute totals
    const totalCents = input.items.reduce((sum, line) => {
      const found = idToItem.get(line.itemId)!;
      return sum + found.priceCents * line.quantity;
    }, 0);

    // Create order and decrement stock in a transaction
    return prisma.$transaction(async (tx) => {
      // Generate a simple order number
      const orderCount = await tx.order.count();
      const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: input.userId,
          status: OrderStatus.PENDING,
          totalCents,
        },
      });

      // Create order items and adjust inventory
      for (const line of input.items) {
        const item = idToItem.get(line.itemId)!;
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            itemId: item.id,
            quantity: line.quantity,
            priceCents: item.priceCents,
          },
        });
        await tx.item.update({
          where: { id: item.id },
          data: { quantity: item.quantity - line.quantity },
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { item: true } } },
      });
    });
  }

  static async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({ where: { id }, data: { status } });
  }
} 