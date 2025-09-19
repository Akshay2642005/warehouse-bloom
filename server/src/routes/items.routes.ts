import { Router } from 'express';
import { createItem, getItems, getItemById, updateItemById, deleteItemById } from '../controllers/items.controller';
import { requireAuth } from '../middlewares/requireAuth';

export const itemsRouter = Router();

/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: List items
 *     tags: [Items]
 */
itemsRouter.get('/', requireAuth, getItems);

/**
 * @openapi
 * /api/items:
 *   post:
 *     summary: Create item
 *     tags: [Items]
 */
itemsRouter.post('/', requireAuth, createItem);

/**
 * @openapi
 * /api/items/{id}:
 *   get:
 *     summary: Get item by id
 *     tags: [Items]
 */
itemsRouter.get('/:id', requireAuth, getItemById);

/**
 * @openapi
 * /api/items/{id}:
 *   put:
 *     summary: Update item by id
 *     tags: [Items]
 */
itemsRouter.put('/:id', requireAuth, updateItemById);

/**
 * @openapi
 * /api/items/{id}:
 *   delete:
 *     summary: Delete item by id
 *     tags: [Items]
 */
itemsRouter.delete('/:id', requireAuth, deleteItemById); 