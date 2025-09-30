import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AlertService } from '../services/alert.service';
import { createResponse } from '../utils/apiResponse';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  acknowledged: z.coerce.boolean().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export async function getAlerts(req: Request, res: Response): Promise<void> {
  const { page, pageSize, acknowledged, severity } = querySchema.parse(req.query);
  
  const where: any = {};
  if (acknowledged !== undefined) where.acknowledged = acknowledged;
  if (severity) where.severity = severity;

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      include: {
        item: {
          select: { name: true, sku: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.alert.count({ where })
  ]);

  res.json(createResponse({
    data: {
      alerts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    },
    message: 'Alerts retrieved successfully'
  }));
}

export async function acknowledgeAlert(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  
  const success = await AlertService.acknowledgeAlert(id);
  if (success) {
    res.json(createResponse({ message: 'Alert acknowledged successfully' }));
  } else {
    res.status(404).json(createResponse({ 
      success: false, 
      message: 'Alert not found' 
    }));
  }
}

export async function acknowledgeAllAlerts(req: Request, res: Response): Promise<void> {
  await prisma.alert.updateMany({
    where: { acknowledged: false },
    data: { acknowledged: true }
  });
  
  res.json(createResponse({ message: 'All alerts acknowledged successfully' }));
}

export async function checkLowStockAlerts(req: Request, res: Response): Promise<void> {
  await AlertService.checkAllItemsForLowStock();
  res.json(createResponse({ message: 'Low stock alerts checked for all items' }));
}