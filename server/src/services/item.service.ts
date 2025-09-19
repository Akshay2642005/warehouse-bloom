import { prisma } from '../utils/prisma';

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
   * Creates a new item with SKU uniqueness check.
   */
  static async createItem(data: CreateItemData) {
    // Check SKU uniqueness
    const existingItem = await prisma.item.findUnique({
      where: { sku: data.sku }
    });
    
    if (existingItem) {
      throw new Error('SKU already exists');
    }

    return prisma.item.create({
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
  }

  /**
   * Gets items with pagination and search.
   */
  static async getItems({ page, pageSize, search }: GetItemsParams) {
    const skip = (page - 1) * pageSize;
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { sku: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.item.count({ where })
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    };
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
   * Updates item by ID with SKU uniqueness check.
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

    return prisma.item.update({
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
  }

  /**
   * Deletes item by ID.
   */
  static async deleteItem(id: string) {
    try {
      await prisma.item.delete({
        where: { id }
      });
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
}