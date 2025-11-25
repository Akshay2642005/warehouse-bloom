import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/organization.middleware.js';
import * as itemController from '../controllers/item.controller.js';

export const itemRouter = Router();

// All item routes require authentication and organization context
itemRouter.use(requireAuth, requireOrganization);

itemRouter.get('/', itemController.getItems);
itemRouter.get('/:id', itemController.getItem);
itemRouter.post('/', itemController.createItem);
itemRouter.put('/:id', itemController.updateItem);
itemRouter.delete('/:id', itemController.deleteItem);
itemRouter.post('/:id/adjust', itemController.adjustQuantity);
