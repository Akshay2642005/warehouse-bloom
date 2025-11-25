import { Response } from 'express';
import { OrgRequest } from '../middleware/organization.middleware.js';
import prisma from '../lib/prisma.js';

/**
 * Get alerts
 * GET /api/alerts
 */
export async function getAlerts(req: OrgRequest, res: Response): Promise<void> {
  const orgId = req.organization!.id;
  const { acknowledged } = req.query;

  const where: any = {
    organizationId: orgId,
  };

  if (acknowledged !== undefined) {
    where.acknowledged = acknowledged === 'true';
  }

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20, // Limit to recent 20 alerts
    include: {
      item: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: alerts,
  });
}

/**
 * Acknowledge alert
 * PATCH /api/alerts/:id/acknowledge
 */
export async function acknowledgeAlert(req: OrgRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const orgId = req.organization!.id;

  const alert = await prisma.alert.update({
    where: {
      id,
      organizationId: orgId, // Ensure alert belongs to org
    },
    data: {
      acknowledged: true,
    },
  });

  res.json({
    success: true,
    data: alert,
    message: 'Alert acknowledged',
  });
}
