import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { getAlerts, acknowledgeAlert, acknowledgeAllAlerts, checkLowStockAlerts } from '../controllers/alerts.controller';

export const alertsRouter = Router();

alertsRouter.get('/', requireAuth, getAlerts);
alertsRouter.patch('/:id/acknowledge', requireAuth, acknowledgeAlert);
alertsRouter.patch('/acknowledge-all', requireAuth, acknowledgeAllAlerts);
alertsRouter.post('/check-low-stock', requireAuth, checkLowStockAlerts);