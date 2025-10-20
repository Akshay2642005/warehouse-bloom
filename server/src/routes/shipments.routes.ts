import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listShipments, createShipment, updateShipmentStatus, updateShipment, deleteShipment, getShipmentStats } from '../controllers/shipments.controller';

export const shipmentsRouter = Router();

shipmentsRouter.get('/', requireAuth, listShipments);
shipmentsRouter.get('/stats', requireAuth, getShipmentStats);
shipmentsRouter.post('/', requireAuth, createShipment);
shipmentsRouter.put('/:id/status', requireAuth, updateShipmentStatus); 
shipmentsRouter.put('/:id', requireAuth, updateShipment);
shipmentsRouter.delete('/:id', requireAuth, deleteShipment);