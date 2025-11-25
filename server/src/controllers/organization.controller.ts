import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { OrgRequest } from '../middleware/organization.middleware.js';
import { OrganizationService } from '../services/organization.service.js';
import { z } from 'zod';
import { OrgRole } from '@prisma/client';

const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['MEMBER', 'ADMIN']).optional(),
});

const updateMemberSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});

/**
 * Create new organization
 * POST /api/organizations
 */
export async function createOrganization(req: AuthRequest, res: Response): Promise<void> {
  const { name, slug } = createOrgSchema.parse(req.body);

  try {
    const organization = await OrganizationService.createOrganization(
      req.user!.id,
      name,
      slug
    );

    res.status(201).json({
      success: true,
      data: organization,
      message: 'Organization created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create organization',
    });
  }
}

/**
 * Get all user's organizations
 * GET /api/organizations
 */
export async function getUserOrganizations(req: AuthRequest, res: Response): Promise<void> {
  const organizations = await OrganizationService.getUserOrganizations(req.user!.id);

  res.json({
    success: true,
    data: organizations,
  });
}

/**
 * Get organization details
 * GET /api/organizations/:id
 */
export async function getOrganization(req: OrgRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const organization = await OrganizationService.getOrganization(id, req.user!.id);

  if (!organization) {
    res.status(404).json({
      success: false,
      message: 'Organization not found or access denied',
    });
    return;
  }

  res.json({
    success: true,
    data: organization,
  });
}

/**
 * Update organization
 * PUT /api/organizations/:id
 */
export async function updateOrganization(req: OrgRequest, res: Response): Promise<void> {
  const { name, logo } = req.body;

  const organization = await OrganizationService.updateOrganization(
    req.organization!.id,
    { name, logo }
  );

  res.json({
    success: true,
    data: organization,
    message: 'Organization updated successfully',
  });
}

/**
 * Delete organization
 * DELETE /api/organizations/:id
 */
export async function deleteOrganization(req: OrgRequest, res: Response): Promise<void> {
  await OrganizationService.deleteOrganization(req.organization!.id);

  res.json({
    success: true,
    message: 'Organization deleted successfully',
  });
}

/**
 * Invite member
 * POST /api/organizations/:id/members/invite
 */
export async function inviteMember(req: OrgRequest, res: Response): Promise<void> {
  const { email, role } = inviteMemberSchema.parse(req.body);

  const invitation = await OrganizationService.inviteMember(
    req.organization!.id,
    email,
    role as OrgRole || OrgRole.MEMBER
  );

  res.status(201).json({
    success: true,
    data: invitation,
    message: 'Invitation sent successfully',
  });
}

/**
 * Remove member
 * DELETE /api/organizations/:id/members/:userId
 */
export async function removeMember(req: OrgRequest, res: Response): Promise<void> {
  const { userId } = req.params;

  try {
    await OrganizationService.removeMember(req.organization!.id, userId);

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Update member role
 * PUT /api/organizations/:id/members/:userId
 */
export async function updateMemberRole(req: OrgRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  const { role } = updateMemberSchema.parse(req.body);

  const member = await OrganizationService.updateMemberRole(
    req.organization!.id,
    userId,
    role as OrgRole
  );

  res.json({
    success: true,
    data: member,
    message: 'Member role updated successfully',
  });
}

/**
 * Accept invitation (public endpoint)
 * POST /api/invitations/:id/accept
 */
export async function acceptInvitation(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const organization = await OrganizationService.acceptInvitation(id, req.user!.id);

    res.json({
      success: true,
      data: organization,
      message: 'Invitation accepted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
