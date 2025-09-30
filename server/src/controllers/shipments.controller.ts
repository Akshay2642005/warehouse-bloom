import { Request, Response } from 'express';
import { ShipmentService } from '../services/shipment.service';
import { z } from 'zod';

const createShipmentSchema = z.object({
  orderId: z.string(),
  carrier: z.string(),
  trackingNumber: z.string(),
  destination: z.string(),
  estimatedDelivery: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.string()
});

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
}).catchall(z.any());

import { prisma } from '../utils/prisma';

export async function listShipments(req: Request, res: Response): Promise<void> {
  const parsed = listSchema.parse(req.query);
  const { page, pageSize: rawPageSize } = parsed;
  const pageSize = Math.min(rawPageSize, 50);
  const skip = (page - 1) * pageSize;
  
  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      skip,
      take: pageSize,
      include: { order: { select: { id: true, orderNumber: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.shipment.count()
  ]);
  
  res.json({ 
    success: true, 
    data: { 
      shipments,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    } 
  });
}

export async function createShipment(req: Request, res: Response): Promise<void> {
  const body = createShipmentSchema.parse(req.body);
  const shipment = await ShipmentService.createShipment({
    orderId: body.orderId,
    carrier: body.carrier,
    trackingNumber: body.trackingNumber,
    destination: body.destination,
    estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : undefined
  });
  res.status(201).json({ success: true, data: { shipment } });
}

export async function updateShipmentStatus(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const { status } = updateStatusSchema.parse(req.body);
  
  await ShipmentService.updateShipmentStatus(id, status);
  
  res.json({ success: true, message: 'Shipment and order status updated' });
}

