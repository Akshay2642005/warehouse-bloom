import { Response } from 'express';
import { OrgRequest } from '../middleware/organization.middleware.js';
import { ItemService } from '../services/item.service.js';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100),
  description: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(10),
  priceCents: z.number().int().min(0).default(0),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  barcode: z.string().optional(),
  location: z.string().optional(),
});

const updateItemSchema = createItemSchema.partial();

const adjustQuantitySchema = z.object({
  adjustment: z.number().int(),
});

/**
 * Get all items
 * GET /api/items
 */
export async function getItems(req: OrgRequest, res: Response): Promise<void> {
  const { page, limit, search, categoryId, lowStock } = req.query;

  const result = await ItemService.getItems(req.organization!.id, {
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    search: search as string,
    categoryId: categoryId as string,
    lowStock: lowStock === 'true',
  });

  res.json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
}

/**
 * Get single item
 * GET /api/items/:id
 */
export async function getItem(req: OrgRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const item = await ItemService.getItemById(id, req.organization!.id);

  if (!item) {
    res.status(404).json({
      success: false,
      message: 'Item not found',
    });
    return;
  }

  res.json({
    success: true,
    data: item,
  });
}

/**
 * Create item
 * POST /api/items
 */
export async function createItem(req: OrgRequest, res: Response): Promise<void> {
  const data = createItemSchema.parse(req.body);

  const item = await ItemService.createItem(req.organization!.id, data);

  res.status(201).json({
    success: true,
    data: item,
    message: 'Item created successfully',
  });
}

/**
 * Update item
 * PUT /api/items/:id
 */
export async function updateItem(req: OrgRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const data = updateItemSchema.parse(req.body);

  const item = await ItemService.updateItem(id, req.organization!.id, data);

  res.json({
    success: true,
    data: item,
    message: 'Item updated successfully',
  });
}

/**
 * Delete item
 * DELETE /api/items/:id
 */
export async function deleteItem(req: OrgRequest, res: Response): Promise<void> {
  const { id } = req.params;

  await ItemService.deleteItem(id, req.organization!.id);

  res.json({
    success: true,
    message: 'Item deleted successfully',
  });
}

/**
 * Adjust item quantity (stock in/out)
 * POST /api/items/:id/adjust
 */
export async function adjustQuantity(req: OrgRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { adjustment } = adjustQuantitySchema.parse(req.body);

  const item = await ItemService.adjustQuantity(id, req.organization!.id, adjustment);

  res.json({
    success: true,
    data: item,
    message: 'Quantity adjusted successfully',
  });
}
