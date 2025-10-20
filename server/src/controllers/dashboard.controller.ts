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

// Recent unified activities (orders, shipments, inventory logs)
export async function getDashboardActivities(req: Request, res: Response): Promise<void> {
  try {
    const limit = 20;
    const [orders, shipmentEvents, inventoryLogs] = await Promise.all([
      prisma.order.findMany({
        select: { id: true, orderNumber: true, status: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      prisma.shipmentEvent.findMany({
        select: { id: true, status: true, createdAt: true, shipmentId: true },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      prisma.inventoryLog.findMany({
        select: { id: true, itemId: true, delta: true, reason: true, createdAt: true, item: { select: { name: true, sku: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ]);

    const activities: any[] = [];
    orders.forEach(o => activities.push({
      id: `order-${o.id}`,
      type: 'order',
      title: `Order ${o.orderNumber}`,
      description: `Order status: ${o.status}`,
      status: o.status === 'PENDING' ? 'warning' : 'success',
      createdAt: o.createdAt
    }));
    shipmentEvents.forEach(se => activities.push({
      id: `ship-${se.id}`,
      type: 'shipment',
      title: `Shipment Update`,
      description: `Shipment event: ${se.status}`,
      status: se.status === 'Delivered' ? 'success' : 'info',
      createdAt: se.createdAt
    }));
    inventoryLogs.forEach(log => activities.push({
      id: `inv-${log.id}`,
      type: 'inventory',
      title: `Inventory ${log.delta > 0 ? 'Added' : 'Adjusted'}`,
      description: `${log.item?.name || 'Item'} (${log.item?.sku || ''}) ${log.delta > 0 ? '+' : ''}${log.delta}`,
      status: log.delta < 0 ? 'warning' : 'success',
      createdAt: log.createdAt
    }));

    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(createResponse({ data: { activities: activities.slice(0, limit) }, message: 'Activities retrieved' }));
  } catch (error) {
    res.status(500).json(createResponse({ success: false, message: 'Failed to retrieve activities' }));
  }
}

// Inventory chart data by category
export async function getInventoryChart(req: Request, res: Response): Promise<void> {
  try {
    const items = await prisma.item.findMany({ select: { id: true, quantity: true, reorderLevel: true, category: { select: { name: true } } } });
    const categoryMap: Record<string, { inStock: number; lowStock: number; outOfStock: number }> = {};
    for (const item of items) {
      const cat = item.category?.name || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = { inStock: 0, lowStock: 0, outOfStock: 0 };
      if (item.quantity === 0) categoryMap[cat].outOfStock += 1;
      else if (item.quantity <= item.reorderLevel) categoryMap[cat].lowStock += 1;
      else categoryMap[cat].inStock += 1;
    }
    const chart = Object.entries(categoryMap).map(([name, counts]) => ({ name, ...counts }));
    res.json(createResponse({ data: { inventoryByCategory: chart }, message: 'Chart data retrieved' }));
  } catch (error) {
    res.status(500).json(createResponse({ success: false, message: 'Failed to retrieve chart data' }));
  }
}