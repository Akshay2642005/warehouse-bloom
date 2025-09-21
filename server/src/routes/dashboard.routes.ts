import { Router } from 'express';
import { ItemService } from '../services/item.service';
import { requireAuth } from '../middlewares/requireAuth';
import { createResponse } from '../utils/apiResponse';

export const dashboardRouter = Router();

/**
 * Get dashboard statistics
 */
dashboardRouter.get('/stats', requireAuth, async (req, res) => {
  try {
    const [totalItems, lowStockItems] = await Promise.all([
      ItemService.getItems({ page: 1, pageSize: 1 }),
      ItemService.getLowStockItems(10)
    ]);

    const stats = {
      totalItems: totalItems.total,
      lowStockCount: lowStockItems.length,
      totalValue: 0 // Will be calculated from items
    };

    // Calculate total inventory value
    if (totalItems.total > 0) {
      const allItems = await ItemService.getItems({
        page: 1,
        pageSize: totalItems.total
      });

      stats.totalValue = allItems.items.reduce((sum, item) =>
        sum + (item.quantity * item.priceCents), 0
      );
    }

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
});

/**
 * Get low stock alerts
 */
dashboardRouter.get('/alerts', requireAuth, async (req, res) => {
  try {
    const lowStockItems = await ItemService.getLowStockItems(10);

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
});
