import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { createResponse } from '../utils/apiResponse';
import { z } from 'zod';

export async function listNotifications(req: Request, res: Response) {
  const userId = req.user!.id;
  const items = await NotificationService.listForUser(userId);
  res.json(createResponse({ data: { notifications: items } }));
}

export async function unreadCount(req: Request, res: Response) {
  const userId = req.user!.id;
  const count = await NotificationService.unreadCount(userId);
  res.json(createResponse({ data: { count } }));
}

const markSchema = z.object({ id: z.string().cuid() });

export async function markNotificationRead(req: Request, res: Response) {
  try {
    const { id } = markSchema.parse(req.params);
    await NotificationService.markRead(req.user!.id, id);
    res.json(createResponse({ message: 'Notification marked read' }));
  } catch {
    res.status(400).json(createResponse({ success: false, message: 'Invalid notification id' }));
  }
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  await NotificationService.markAllRead(req.user!.id);
  res.json(createResponse({ message: 'All notifications marked read' }));
}
