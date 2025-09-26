import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

export const shipmentsRouter = Router();

shipmentsRouter.get('/', requireAuth, async (req, res) => {
  const list = await prisma.shipment.findMany({ include: { order: true }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: { shipments: list } });
});

shipmentsRouter.post('/', requireAuth, async (req, res) => {
  const schema = z.object({ orderId: z.string(), carrier: z.string(), trackingNumber: z.string(), destination: z.string(), estimatedDelivery: z.string().optional() });
  const body = schema.parse(req.body);
  const created = await prisma.shipment.create({ data: { orderId: body.orderId, carrier: body.carrier, trackingNumber: body.trackingNumber, destination: body.destination, estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : null } });
  res.status(201).json({ success: true, data: { shipment: created } });
}); 