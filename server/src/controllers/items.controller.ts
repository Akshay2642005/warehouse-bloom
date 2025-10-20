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
  try {
    const parsed = queryItemsSchema.parse(req.query);
    const { page = 1, pageSize: rawPageSize = 50, q, status, sortBy } = parsed;
    const pageSize = Math.min(rawPageSize, 100); // Force cap at 100

    const result = await SearchService.searchItems({
      query: q,
      page,
      pageSize: Math.min(pageSize, 50),
      filters: { status, sortBy },
      tenantId: req.tenantId
    });

    res.set({
      'Cache-Control': 'public, max-age=60',
      'ETag': `"${JSON.stringify({ page, pageSize, q, status, sortBy })}"`
    });

    res.status(200).json(createResponse({
      data: result,
      message: 'Items retrieved successfully'
    }));
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json(createResponse({ success: false, message: 'Invalid query parameters', errors: err.flatten ? err.flatten() : undefined }));
      return;
    }
    console.error('getItems error', err);
    res.status(500).json(createResponse({ success: false, message: 'Failed to retrieve items' }));
  }
}

/**
 * Creates a new item.
 */
export async function createItem(req: Request, res: Response): Promise<void> {
  try {
    const itemData = createItemSchema.parse(req.body);
    const userId = req.user!.id;
    
    const item = await ItemService.createItem({ ...itemData, ownerId: userId, tenantId: req.tenantId });
    
    res.status(201).json(createResponse({ 
      data: { item },
      message: 'Item created successfully'
    }));
  } catch (error: any) {
    // Validation errors from Zod
    if (error instanceof z.ZodError) {
      const errs = error.errors.reduce((acc, e) => { acc[e.path.join('.') || 'root'] = e.message; return acc; }, {} as Record<string,string>);
      res.status(400).json(createResponse({
        success: false,
        message: 'Validation failed',
        errors: errs
      }));
      return;
    }
    if (error?.message === 'SKU already exists') {
      res.status(409).json(createResponse({
        success: false,
        message: 'SKU already exists. Please use a different SKU.'
      }));
      return;
    }
    // Let the global error handler format anything else
    throw error;
  }
}

/**
 * Retrieves a single item by id.
 */
export async function getItemById(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  
  const item = await ItemService.getItemById(id, req.tenantId);
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
    
    const item = await ItemService.updateItem(id, updateData, req.tenantId);
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
    if (error instanceof z.ZodError) {
      const errs = error.errors.reduce((acc, e) => { acc[e.path.join('.') || 'root'] = e.message; return acc; }, {} as Record<string,string>);
      res.status(400).json(createResponse({
        success: false,
        message: 'Validation failed',
        errors: errs
      }));
      return;
    }
    if (error?.message === 'SKU already exists') {
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
  
  const deleted = await ItemService.deleteItem(id, req.tenantId);
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
  
  const item = await ItemService.restockItem(id, amount, req.tenantId);
  if (!item) {
    res.status(404).json(createResponse({ success: false, message: 'Item not found' }));
    return;
  }
  
  res.status(200).json(createResponse({ 
    data: { item },
    message: `Item restocked with ${amount} units`
  }));
} 

/**
 * Lists low stock items under threshold (default 10) for dashboard/alerts.
 */
export async function getLowStock(_req: Request, res: Response): Promise<void> {
  const items = await ItemService.getLowStockItems(10, req.tenantId);
  res.status(200).json(createResponse({ data: { items }, message: 'Low stock items retrieved' }));
}