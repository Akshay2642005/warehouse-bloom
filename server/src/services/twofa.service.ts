import * as speakeasy from 'speakeasy';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export class TwoFAService {
  /**
   * Generate 2FA secret for user
   */
  static generateSecret(userEmail: string) {
    const secret = speakeasy.generateSecret({
      name: `Warehouse Bloom (${userEmail})`,
      issuer: 'Warehouse Bloom',
      length: 32
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate OTP auth URL');
    }

    return {
      secret: secret.base32!,
      qrCodeUrl: secret.otpauth_url,
      manualEntryKey: secret.base32!
    };
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId: string, secret: string, token: string) {
    try {
      // Verify the token first
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (!verified) {
        throw new Error('Invalid verification code');
      }

      // Update user with 2FA enabled
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: secret
        },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true
        }
      });

      logger.info('2FA enabled for user', { userId });
      return user;

    } catch (error) {
      logger.error('Failed to enable 2FA', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Disable 2FA for user
   */
  static async disable2FA(userId: string, token: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true, twoFactorEnabled: true }
      });

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error('2FA not enabled for this user');
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (!verified) {
        throw new Error('Invalid verification code');
      }

      // Disable 2FA
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null
        },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true
        }
      });

      logger.info('2FA disabled for user', { userId });
      return updatedUser;

    } catch (error) {
      logger.error('Failed to disable 2FA', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Verify 2FA token
   */
  static async verifyToken(userId: string, token: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true, twoFactorEnabled: true }
      });

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error('2FA not enabled for this user');
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });

      return verified;

    } catch (error) {
      logger.error('Failed to verify 2FA token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return false;
    }
  }

  /**
   * Get 2FA status for user
   */
  static async get2FAStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true }
    });

    return {
      enabled: user?.twoFactorEnabled || false
    };
  }
}