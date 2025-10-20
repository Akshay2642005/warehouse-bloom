import { prisma } from '../utils/prisma';

export class NotificationService {
  static async listForUser(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  static async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  }

  static async markRead(userId: string, id: string) {
    await prisma.notification.update({ where: { id }, data: { read: true } });
    return true;
  }

  static async markAllRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return true;
  }

  static async create(userId: string, message: string, type: string) {
    return prisma.notification.create({ data: { userId, message, type } });
  }
}
