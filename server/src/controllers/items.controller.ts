import { Request, Response } from 'express';
import { ItemService } from '../services/item.service';
import { SearchService } from '../services/search.service';
import { AlertService } from '../services/alert.service';
import { createItemSchema, updateItemSchema, queryItemsSchema } from '../validation/item.schema';
import { createResponse } from '../utils/apiResponse';
import { z } from 'zod';

/**
 * Lists items with pagination and filters using optimized search.
 */
export async function getItems(req: Request, res: Response): Promise<void> {
  const parsed = queryItemsSchema.parse(req.query);
  const { page = 1, pageSize: rawPageSize = 10, q, status, sortBy } = parsed;
  const pageSize = Math.min(rawPageSize, 50); // Force cap at 50
  
  const result = await SearchService.searchItems({
    query: q,
    page,
    pageSize: Math.min(pageSize, 50), // Cap at 50 for performance
    filters: { status, sortBy }
  });
  
  // Set cache headers for better client-side caching
  res.set({
    'Cache-Control': 'public, max-age=60', // Cache for 1 minute
    'ETag': `"${JSON.stringify({ page, pageSize, q, status, sortBy })}"`
  });
  
  res.status(200).json(createResponse({ 
    data: result,
    message: 'Items retrieved successfully'
  }));
}

/**
 * Creates a new item.
 */
export async function createItem(req: Request, res: Response): Promise<void> {
  try {
    const itemData = createItemSchema.parse(req.body);
    const userId = req.user!.id;
    
    const item = await ItemService.createItem({ ...itemData, ownerId: userId });
    
    res.status(201).json(createResponse({ 
      data: { item },
      message: 'Item created successfully'
    }));
  } catch (error: any) {
    if (error.message === 'SKU already exists') {
      res.status(409).json(createResponse({ 
        success: false, 
        message: 'SKU already exists. Please use a different SKU.' 
      }));
      return;
    }
    throw error;
  }
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
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const updateData = updateItemSchema.parse(req.body);
    
    const item = await ItemService.updateItem(id, updateData);
    if (!item) {
      res.status(404).json(createResponse({ success: false, message: 'Item not found' }));
      return;
    }
    
    // Check for low stock and create alert if needed
    if (updateData.quantity !== undefined) {
      await AlertService.createLowStockAlert(id, updateData.quantity);
    }
    
    res.status(200).json(createResponse({ 
      data: { item },
      message: 'Item updated successfully'
    }));
  } catch (error: any) {
    if (error.message === 'SKU already exists') {
      res.status(409).json(createResponse({ 
        success: false, 
        message: 'SKU already exists. Please use a different SKU.' 
      }));
      return;
    }
    throw error;
  }
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

/**
 * Restock an item (add to existing quantity)
 */
export async function restockItem(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const { amount } = z.object({ amount: z.number().positive() }).parse(req.body);
  
  const item = await ItemService.restockItem(id, amount);
  if (!item) {
    res.status(404).json(createResponse({ success: false, message: 'Item not found' }));
    return;
  }
  
  res.status(200).json(createResponse({ 
    data: { item },
    message: `Item restocked with ${amount} units`
  }));
} 