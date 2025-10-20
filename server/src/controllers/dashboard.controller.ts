import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createResponse } from '../utils/apiResponse';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const [
      totalItems,
      lowStockItems,
      totalOrders,
      pendingOrders,
      totalValue
    ] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({ where: { quantity: { lte: 10 } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.item.aggregate({
        _sum: {
          priceCents: true
        }
      })
    ]);

    const stats = {
      totalItems,
      lowStockCount: lowStockItems,
      totalOrders,
      pendingOrders,
      totalValue: totalValue._sum.priceCents || 0
    };

    res.json(createResponse({
      data: stats,
      message: 'Dashboard stats retrieved successfully'
    }));
  } catch (error) {
    res.status(500).json(createResponse({
      success: false,
      message: 'Failed to retrieve dashboard stats'
    }));
  }
}

export async function getDashboardAlerts(req: Request, res: Response): Promise<void> {
  try {
    // Get low stock items (quantity <= 10)
    const lowStockItems = await prisma.item.findMany({
      where: { quantity: { lte: 10 } },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        priceCents: true
      },
      orderBy: { quantity: 'asc' }
    });

    res.json(createResponse({
      data: { alerts: lowStockItems },
      message: 'Alerts retrieved successfully'
    }));
  } catch (error) {
    res.status(500).json(createResponse({
      success: false,
      message: 'Failed to retrieve alerts'
    }));
  }
}