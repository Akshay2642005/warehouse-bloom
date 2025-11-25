import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/organization.middleware.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

export const dashboardRouter = Router();

// All dashboard routes require authentication and organization context
dashboardRouter.use(requireAuth, requireOrganization);

dashboardRouter.get('/stats', dashboardController.getStats);
