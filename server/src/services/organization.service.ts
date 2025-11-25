import prisma from '../lib/prisma.js';
import { OrgRole, InvitationStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class OrganizationService {
  /**
   * Create organization and add creator as owner
   */
  static async createOrganization(userId: string, name: string, slug: string) {
    // Check if slug is available
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      throw new Error('Organization slug already taken');
    }

    return await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name,
          slug,
        },
      });

      // Add creator as owner
      await tx.member.create({
        data: {
          organizationId: organization.id,
          userId,
          role: OrgRole.OWNER,
        },
      });

      // Create trial subscription
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day trial

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.TRIAL,
          trialEndsAt,
        },
      });

      return organization;
    });
  }

  /**
   * Get all organizations for a user
   */
  static async getUserOrganizations(userId: string) {
    const members = await prisma.member.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            subscription: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return members.map((m) => ({
      ...m.organization,
      role: m.role,
    }));
  }

  /**
   * Get organization by ID with member verification
   */
  static async getOrganization(organizationId: string, userId: string) {
    const member = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      include: {
        organization: {
          include: {
            subscription: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!member) return null;

    return {
      ...member.organization,
      userRole: member.role,
    };
  }

  /**
   * Update organization (owner/admin only)
   */
  static async updateOrganization(
    organizationId: string,
    data: { name?: string; logo?: string }
  ) {
    return await prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  }

  /**
   * Delete organization (owner only)
   */
  static async deleteOrganization(organizationId: string) {
    await prisma.organization.delete({
      where: { id: organizationId },
    });
  }

  /**
   * Invite member to organization
   */
  static async inviteMember(
    organizationId: string,
    email: string,
    role: OrgRole = OrgRole.MEMBER
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    return await prisma.invitation.create({
      data: {
        organizationId,
        email,
        role,
        expiresAt,
      },
    });
  }

  /**
   * Accept invitation
   */
  static async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) throw new Error('Invitation not found');
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error('Invitation already processed');
    }
    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation expired');
    }

    return await prisma.$transaction(async (tx) => {
      // Add member
      await tx.member.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: invitation.role,
        },
      });

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.ACCEPTED },
      });

      return await tx.organization.findUnique({
        where: { id: invitation.organizationId },
      });
    });
  }

  /**
   * Remove member from organization
   */
  static async removeMember(organizationId: string, userId: string) {
    // Don't allow removing the last owner
    const owners = await prisma.member.count({
      where: {
        organizationId,
        role: OrgRole.OWNER,
      },
    });

    const member = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (member?.role === OrgRole.OWNER && owners <= 1) {
      throw new Error('Cannot remove the last owner. Transfer ownership first.');
    }

    await prisma.member.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    organizationId: string,
    userId: string,
    role: OrgRole
  ) {
    return await prisma.member.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: { role },
    });
  }
}
