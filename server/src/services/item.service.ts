import prisma from '../lib/prisma.js';

export class ItemService {
  /**
   * Get all items for an organization with pagination and filters
   */
  static async getItems(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      lowStock?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 50, search, categoryId, lowStock } = options;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (lowStock) {
      where.quantity = { lte: prisma.item.fields.minQuantity };
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          category: true,
          supplier: true,
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.item.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single item by ID
   */
  static async getItemById(itemId: string, organizationId: string) {
    return await prisma.item.findFirst({
      where: {
        id: itemId,
        organizationId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  /**
   * Create new item
   */
  static async createItem(organizationId: string, data: {
    name: string;
    sku: string;
    description?: string;
    quantity?: number;
    minQuantity?: number;
    priceCents?: number;
    categoryId?: string;
    supplierId?: string;
    imageUrl?: string;
    barcode?: string;
    location?: string;
  }) {
    return await prisma.item.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  /**
   * Update item
   */
  static async updateItem(
    itemId: string,
    organizationId: string,
    data: Partial<{
      name: string;
      sku: string;
      description: string;
      quantity: number;
      minQuantity: number;
      priceCents: number;
      categoryId: string;
      supplierId: string;
      imageUrl: string;
      barcode: string;
      location: string;
    }>
  ) {
    return await prisma.item.update({
      where: {
        id: itemId,
        organizationId,
      },
      data,
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  /**
   * Delete item
   */
  static async deleteItem(itemId: string, organizationId: string) {
    await prisma.item.delete({
      where: {
        id: itemId,
        organizationId,
      },
    });
  }

  /**
   * Adjust item quantity (for stock in/out)
   */
  static async adjustQuantity(
    itemId: string,
    organizationId: string,
    adjustment: number
  ) {
    const item = await prisma.item.findFirst({
      where: { id: itemId, organizationId },
    });

    if (!item) throw new Error('Item not found');

    const newQuantity = Math.max(0, item.quantity + adjustment);

    // Check for low stock alert
    if (newQuantity <= item.minQuantity && item.quantity > item.minQuantity) {
      // Create low stock alert
      await prisma.alert.create({
        data: {
          organizationId,
          itemId,
          type: 'LOW_STOCK',
          severity: newQuantity === 0 ? 'CRITICAL' : 'MEDIUM',
          message: `${item.name} is ${newQuantity === 0 ? 'out of stock' : 'running low'}`,
        },
      });
    }

    return await prisma.item.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });
  }
}
