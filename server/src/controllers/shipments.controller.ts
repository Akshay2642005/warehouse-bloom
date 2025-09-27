import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
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

export async function listShipments(req: Request, res: Response): Promise<void> {
  const shipments = await prisma.shipment.findMany({
    include: { order: { select: { id: true, orderNumber: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: { shipments } });
}

export async function createShipment(req: Request, res: Response): Promise<void> {
  const body = createShipmentSchema.parse(req.body);
  const shipment = await prisma.shipment.create({
    data: {
      orderId: body.orderId,
      carrier: body.carrier,
      trackingNumber: body.trackingNumber,
      destination: body.destination,
      estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : null
    },
    include: { order: { select: { id: true, orderNumber: true } } }
  });
  res.status(201).json({ success: true, data: { shipment } });
}

export async function updateShipmentStatus(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const { status } = updateStatusSchema.parse(req.body);
  
  await prisma.shipment.update({
    where: { id },
    data: { status }
  });
  
  res.json({ success: true, message: 'Shipment status updated' });
}