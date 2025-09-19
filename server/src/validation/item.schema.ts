import { z } from 'zod';

/** Schema for creating a new item */
export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  sku: z.string().min(1, 'SKU is required').max(100),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  priceCents: z.number().int().min(0, 'Price must be non-negative'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional()
});

/** Schema for updating an item */
export const updateItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sku: z.string().min(1).max(100).optional(),
  quantity: z.number().int().min(0).optional(),
  priceCents: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional()
});

/** Schema for querying items */
export const queryItemsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().optional()
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type QueryItemsInput = z.infer<typeof queryItemsSchema>;