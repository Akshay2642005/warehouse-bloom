import { Response } from 'express';
import { OrgRequest } from '../middleware/organization.middleware.js';
import prisma from '../lib/prisma.js';

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
export async function getStats(req: OrgRequest, res: Response): Promise<void> {
  const orgId = req.organization!.id;

  const [totalItems, lowStockCount, totalValueResult] = await Promise.all([
    // Total items count
    prisma.item.count({
      where: { organizationId: orgId },
    }),

    // Low stock items count
    prisma.item.count({
      where: {
        organizationId: orgId,
        quantity: {
          lte: prisma.item.fields.minQuantity,
        },
      },
    }),

    // Total value of inventory
    prisma.item.aggregate({
      where: { organizationId: orgId },
      _sum: {
        priceCents: true, // This is actually price * quantity, but we need to do it carefully
      },
    }),
  ]);

  // Prisma doesn't support sum(price * quantity) directly in aggregate easily without raw query
  // For now, let's fetch all items and calculate or use a raw query
  // Using raw query for performance
  const totalValueRaw = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT SUM(quantity * "priceCents") as total
    FROM "Item"
    WHERE "organizationId" = ${orgId}
  `;

  const totalValue = totalValueRaw[0]?.total ? Number(totalValueRaw[0].total) : 0;

  res.json({
    success: true,
    data: {
      totalItems,
      lowStockCount,
      totalValue,
    },
  });
}
