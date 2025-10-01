import { Request, Response } from 'express';
import { OrdersService } from '../services/order.service';
import { AlertService } from '../services/alert.service';
import { z } from 'zod';

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
}).catchall(z.any());

const createOrderSchema = z.object({
  items: z.array(z.object({ itemId: z.string(), quantity: z.number().int().positive() })).min(1),
});

const updateStatusSchema = z.object({ status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) });

export async function listOrders(req: Request, res: Response): Promise<void> {
  try {
    const parsed = listSchema.parse(req.query);
    const { page, pageSize: rawPageSize, search, status } = parsed;
    const pageSize = Math.min(rawPageSize, 50);
    const result = await OrdersService.listOrders({ page, pageSize, search, status });
    res.set({
      'Cache-Control': 'no-cache, must-revalidate',
      'ETag': `"orders-${Date.now()}-${JSON.stringify({ page, pageSize, search, status })}"`
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.flatten?.() });
      return;
    }
    throw error;
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const order = await OrdersService.getOrder(id);
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
  res.status(200).json({ success: true, data: { order } });
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const { items } = createOrderSchema.parse(req.body);
    const userId = req.user!.id;
    const order = await OrdersService.createOrder({ userId, items });
    res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.flatten?.() });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    throw error;
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { status } = updateStatusSchema.parse(req.body);
    await OrdersService.updateStatus(id, status as any);
    await AlertService.createOrderAlert(id, status);
    res.status(200).json({ success: true, message: 'Order status updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.flatten?.() });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    throw error;
  }
} 