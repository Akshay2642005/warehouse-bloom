import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { getDashboardStats, getDashboardAlerts } from '../controllers/dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', requireAuth, getDashboardStats);
dashboardRouter.get('/alerts', requireAuth, getDashboardAlerts);
