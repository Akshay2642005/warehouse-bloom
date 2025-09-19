import { Request, Response } from 'express';
import { ItemService } from '../services/item.service';
import { createItemSchema, updateItemSchema, queryItemsSchema } from '../validation/item.schema';
import { createResponse } from '../utils/apiResponse';
import { z } from 'zod';

/**
 * Lists items with pagination and filters.
 */
export async function getItems(req: Request, res: Response): Promise<void> {
  const { page = 1, pageSize = 10, q } = queryItemsSchema.parse(req.query);
  
  const result = await ItemService.getItems({ page, pageSize, search: q });
  
  res.status(200).json(createResponse({ 
    data: result,
    message: 'Items retrieved successfully'
  }));
}

/**
 * Creates a new item.
 */
export async function createItem(req: Request, res: Response): Promise<void> {
  const itemData = createItemSchema.parse(req.body);
  const userId = req.user!.id;
  
  const item = await ItemService.createItem({ ...itemData, ownerId: userId });
  
  res.status(201).json(createResponse({ 
    data: { item },
    message: 'Item created successfully'
  }));
}

/**
 * Retrieves a single item by id.
 */
export async function getItemById(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  
  const item = await ItemService.getItemById(id);
  if (!item) {
    res.status(404).json(createResponse({ success: false, message: 'Item not found' }));
    return;
  }
  
  res.status(200).json(createResponse({ 
    data: { item },
    message: 'Item retrieved successfully'
  }));
}

/**
 * Updates an item by id.
 */
export async function updateItemById(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const updateData = updateItemSchema.parse(req.body);
  
  const item = await ItemService.updateItem(id, updateData);
  if (!item) {
    res.status(404).json(createResponse({ success: false, message: 'Item not found' }));
    return;
  }
  
  res.status(200).json(createResponse({ 
    data: { item },
    message: 'Item updated successfully'
  }));
}

/**
 * Deletes an item by id.
 */
export async function deleteItemById(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  
  const deleted = await ItemService.deleteItem(id);
  if (!deleted) {
    res.status(404).json(createResponse({ success: false, message: 'Item not found' }));
    return;
  }
  
  res.status(204).send();
} 