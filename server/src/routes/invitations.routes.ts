import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { createInvitation, listInvitations, acceptInvitation } from '../controllers/invitations.controller';

export const invitationsRouter = Router();

// Admin-protected endpoints
invitationsRouter.post('/', requireAuth, createInvitation);
invitationsRouter.get('/', requireAuth, listInvitations);

// Public/unauthenticated accept (could require auth depending on flow)
invitationsRouter.post('/accept', acceptInvitation);