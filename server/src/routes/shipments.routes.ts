import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listShipments, createShipment, updateShipmentStatus } from '../controllers/shipments.controller';

export const shipmentsRouter = Router();

shipmentsRouter.get('/', requireAuth, listShipments);
shipmentsRouter.post('/', requireAuth, createShipment);
shipmentsRouter.put('/:id/status', requireAuth, updateShipmentStatus); 