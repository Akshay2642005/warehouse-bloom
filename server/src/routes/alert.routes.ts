import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/organization.middleware.js';
import * as alertController from '../controllers/alert.controller.js';

export const alertRouter = Router();

// All alert routes require authentication and organization context
alertRouter.use(requireAuth, requireOrganization);

alertRouter.get('/', alertController.getAlerts);
alertRouter.patch('/:id/acknowledge', alertController.acknowledgeAlert);
