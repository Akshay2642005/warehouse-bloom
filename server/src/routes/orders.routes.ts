import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { createOrder, getOrder, listOrders, updateOrderStatus } from '../controllers/orders.controller';

export const ordersRouter = Router();

ordersRouter.get('/', requireAuth, listOrders);
ordersRouter.get('/:id', requireAuth, getOrder);
ordersRouter.post('/', requireAuth, createOrder);
ordersRouter.put('/:id/status', requireAuth, updateOrderStatus); 