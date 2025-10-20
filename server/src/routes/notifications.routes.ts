import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { listNotifications, unreadCount, markNotificationRead, markAllNotificationsRead } from '../controllers/notification.controller';

const router = Router();
router.get('/', requireAuth, listNotifications);
router.get('/unread-count', requireAuth, unreadCount);
router.post('/mark-all', requireAuth, markAllNotificationsRead);
router.post('/:id/mark', requireAuth, markNotificationRead);

export default router;
