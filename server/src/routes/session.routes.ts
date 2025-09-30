import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { getUserSessions, revokeSession, revokeAllSessions } from '../controllers/session.controller';

export const sessionRouter = Router();

sessionRouter.get('/', requireAuth, getUserSessions);
sessionRouter.delete('/:sessionId', requireAuth, revokeSession);
sessionRouter.delete('/', requireAuth, revokeAllSessions);