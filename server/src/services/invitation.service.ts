import { prisma } from '../utils/prisma';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';

export class InvitationService {
  static generateToken(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  /**
   * Creates a new invitation. If a still-valid, unaccepted invitation already exists for the same email,
   * it is returned instead of creating a new one (prevents spamming duplicates).
   */
  static async createInvitation(email: string, role: string, invitedById: string, ttlHours = 48) {
    const delegate: any = (prisma as any).invitationToken;
    if (!delegate) {
      throw new Error('InvitationToken delegate not found on Prisma client. Did you run prisma generate after adding the model?');
    }
    const existing = await delegate.findFirst({
      where: {
        email: email.toLowerCase(),
        accepted: false,
        expiresAt: { gt: new Date() }
      }
    });
    if (existing) {
      // Optionally update role if different
      if (existing.role !== role) {
  return delegate.update({
          where: { id: existing.id },
            data: { role }
        });
      }
      return existing;
    }
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  return delegate.create({
      data: { email: email.toLowerCase(), role, token, expiresAt, invitedById }
    });
  }

  static async getValidInvitation(token: string) {
  const delegate: any = (prisma as any).invitationToken;
  if (!delegate) return null;
  return delegate.findFirst({
      where: { token, accepted: false, expiresAt: { gt: new Date() } }
    });
  }

  /**
   * Accepts an invitation token if still valid and not previously accepted. Uses a transaction to avoid race conditions.
   */
  static async acceptInvitation(token: string) {
    return prisma.$transaction(async (tx: any) => {
      const delegate = tx.invitationToken;
      if (!delegate) throw new Error('InvitationToken delegate missing in transaction client');
      const invite = await delegate.findUnique({ where: { token } });
      if (!invite) throw new Error('INVITE_NOT_FOUND');
      if (invite.accepted) throw new Error('INVITE_ALREADY_USED');
      if (invite.expiresAt <= new Date()) throw new Error('INVITE_EXPIRED');
      const updated = await delegate.update({ where: { token }, data: { accepted: true } });
      return updated;
    });
  }

  /**
   * Deletes expired invitations (housekeeping) – can be invoked by a scheduled job.
   */
  static async purgeExpired(before: Date = new Date()) {
    const delegate: any = (prisma as any).invitationToken;
    if (!delegate) return { count: 0 };
    return delegate.deleteMany({ where: { expiresAt: { lt: before }, accepted: false } });
  }
}