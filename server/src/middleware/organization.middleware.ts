import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import prisma from '../lib/prisma.js';
import { OrgRole } from '@prisma/client';

export interface OrgRequest extends AuthRequest {
  organization?: {
    id: string;
    name: string;
    slug: string;
    role: OrgRole;
  };
}

/**
 * Middleware to inject organization context from header
 * Requires: requireAuth middleware must run first
 */
export async function requireOrganization(
  req: OrgRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  // Get org ID from header
  const orgId = req.headers['x-organization-id'] as string;

  if (!orgId) {
    res.status(400).json({ success: false, message: 'Organization context required. Please select an organization.' });
    return;
  }

  try {
    // Verify user is member of this organization
    const member = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: req.user.id,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!member) {
      res.status(403).json({ success: false, message: 'Access denied to this organization' });
      return;
    }

    req.organization = {
      id: member.organization.id,
      name: member.organization.name,
      slug: member.organization.slug,
      role: member.role,
    };

    next();
  } catch (error) {
    console.error('Organization middleware error:', error);
    res.status(500).json({ success: false, message: 'Failed to load organization context' });
  }
}

/**
 * Middleware to check if user has required role in organization
 */
export function requireOrgRole(allowedRoles: OrgRole[]) {
  return (req: OrgRequest, res: Response, next: NextFunction): void => {
    if (!req.organization) {
      res.status(500).json({ success: false, message: 'Organization context missing' });
      return;
    }

    if (!allowedRoles.includes(req.organization.role)) {
      res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`
      });
      return;
    }

    next();
  };
}

/**
 * Helper to check if user is org owner or admin
 */
export const requireOrgAdmin = requireOrgRole([OrgRole.OWNER, OrgRole.ADMIN]);

/**
 * Helper to check if user is org owner
 */
export const requireOrgOwner = requireOrgRole([OrgRole.OWNER]);
