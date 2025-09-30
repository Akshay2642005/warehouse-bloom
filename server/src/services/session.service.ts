import { prisma } from '../utils/prisma';

interface UserSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: Date;
  createdAt: Date;
}

export class SessionService {
  static async createSession(userId: string, ipAddress: string, userAgent: string): Promise<string> {
    const session = await prisma.userSession.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        lastActivity: new Date()
      }
    });
    return session.id;
  }

  static async updateSession(sessionId: string): Promise<void> {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() }
    });
  }

  static async getUserSessions(userId: string): Promise<UserSession[]> {
    return await prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActivity: 'desc' }
    });
  }

  static async revokeSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.userSession.delete({
        where: { id: sessionId }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: {
        userId,
        ...(exceptSessionId && { id: { not: exceptSessionId } })
      }
    });
  }

  static async cleanupExpiredSessions(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.userSession.deleteMany({
      where: {
        lastActivity: { lt: thirtyDaysAgo }
      }
    });
  }
}