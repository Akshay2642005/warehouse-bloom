import { Request, Response } from 'express';
import { OrdersService } from '../services/order.service';
import { z } from 'zod';

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

const createOrderSchema = z.object({
  items: z.array(z.object({ itemId: z.string(), quantity: z.number().int().positive() })).min(1),
});

const updateStatusSchema = z.object({ status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) });

export async function listOrders(req: Request, res: Response): Promise<void> {
  const { page, pageSize } = listSchema.parse(req.query);
  const result = await OrdersService.listOrders({ page, pageSize });
  res.status(200).json({ success: true, data: result });
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const order = await OrdersService.getOrder(id);
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
  res.status(200).json({ success: true, data: { order } });
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const { items } = createOrderSchema.parse(req.body);
  const userId = req.user!.id;
  const order = await OrdersService.createOrder({ userId, items });
  res.status(201).json({ success: true, data: { order } });
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const { status } = updateStatusSchema.parse(req.body);
  await OrdersService.updateStatus(id, status as any);
  res.status(200).json({ success: true, message: 'Order status updated' });
} 