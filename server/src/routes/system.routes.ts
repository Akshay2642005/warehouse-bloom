import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { getSystemStatus, getSystemMetrics } from '../controllers/system.controller';

export const systemRouter = Router();

systemRouter.get('/status', requireAuth, getSystemStatus);
systemRouter.get('/metrics', requireAuth, getSystemMetrics);