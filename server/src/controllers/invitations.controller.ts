import { Request, Response } from 'express';
import { z } from 'zod';
import { InvitationService } from '../services/invitation.service';
import { createResponse } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string().min(1)
});

const acceptSchema = z.object({ token: z.string().min(10) });

export async function createInvitation(req: Request, res: Response) {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json(createResponse({ success: false, message: 'Forbidden' }));
    }
    const { email, role } = inviteSchema.parse(req.body);
    // New rule: only allow inviting an already registered user (e.g., to elevate / re-send access)
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!existing) {
        // Business rule: Only allow inviting an email that already belongs to a registered user (internal enablement)
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!existingUser) {
          return res.status(400).json(createResponse({ success: false, message: 'User with this email is not registered' }));
        }
    }
    const invitation = await InvitationService.createInvitation(email, role, req.user.id);
    // TODO: integrate email provider here
    res.status(201).json(createResponse({ data: { invitation }, message: 'Invitation created' }));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(createResponse({ success: false, message: 'Validation error' }));
    }
    res.status(500).json(createResponse({ success: false, message: 'Failed to create invitation' }));
  }
}

export async function listInvitations(_req: Request, res: Response) {
  try {
    const delegate: any = (prisma as any).invitationToken;
    if (!delegate) {
      return res.status(500).json(createResponse({ success: false, message: 'Invitation model not initialized' }));
    }
    const invitations = await delegate.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json(createResponse({ data: { invitations }, message: 'Invitations retrieved' }));
  } catch {
    res.status(500).json(createResponse({ success: false, message: 'Failed to fetch invitations' }));
  }
}

export async function acceptInvitation(req: Request, res: Response) {
  try {
    const { token } = acceptSchema.parse(req.body);
    const invitation = await InvitationService.getValidInvitation(token);
    if (!invitation) {
      return res.status(400).json(createResponse({ success: false, message: 'Invalid or expired invitation' }));
    }
    if (invitation.accepted) {
      return res.status(400).json(createResponse({ success: false, message: 'Invitation already used' }));
    }
    try {
      await InvitationService.acceptInvitation(token);
    } catch (e: any) {
      const code = e?.message;
      const map: Record<string, string> = {
        INVITE_NOT_FOUND: 'Invitation not found',
        INVITE_ALREADY_USED: 'Invitation already used',
        INVITE_EXPIRED: 'Invitation expired'
      };
      const msg = map[code] || 'Failed to accept invitation';
      return res.status(400).json(createResponse({ success: false, message: msg }));
    }
    // Accept flow would normally direct user to registration with pre-filled email/role
    res.json(createResponse({ data: { email: invitation.email, role: invitation.role }, message: 'Invitation accepted' }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(createResponse({ success: false, message: 'Validation error' }));
    }
    res.status(500).json(createResponse({ success: false, message: 'Failed to accept invitation' }));
  }
}