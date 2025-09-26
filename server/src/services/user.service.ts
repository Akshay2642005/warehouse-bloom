import { prisma } from '../utils/prisma';
import { comparePassword, hashPassword } from '../utils/password';

export interface UpdateUserData {
  email?: string;
  role?: string;
  name?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
}

/**
 * Service for user management operations
 */
export class UserService {
  /**
   * Get all users (excluding passwords)
   */
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get user by ID (excluding password)
   */
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true
          }
        }
      }
    });
  }

  /**
   * Update user profile
   */
  static async updateUser(id: string, data: UpdateUserData) {
    try {
      if (data.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email }
        });
        if (existingUser && existingUser.id !== id) {
          throw new Error('Email already exists');
        }
      }

      return prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          avatarUrl: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, password: true }
      });
      if (!user) return false;
      const isValidPassword = await comparePassword(currentPassword, user.password);
      if (!isValidPassword) return false;
      const hashedNewPassword = await hashPassword(newPassword);
      await prisma.user.update({ where: { id }, data: { password: hashedNewPassword } });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async setTwoFactor(id: string, enabled: boolean, secret?: string | null) {
    return prisma.user.update({ where: { id }, data: { twoFactorEnabled: enabled, twoFactorSecret: secret ?? undefined }, select: { id: true, twoFactorEnabled: true } });
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const [totalUsers, adminCount, userCount, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      })
    ]);

    return { totalUsers, adminCount, userCount, recentUsers };
  }
}
