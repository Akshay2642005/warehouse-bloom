import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const [
      totalItems,
      lowStockItems,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentActivities
    ] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({
        where: {
          quantity: {
            lte: prisma.$queryRaw`min_stock`
          }
        }
      }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      prisma.activity.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          item: {
            select: {
              name: true,
              sku: true
            }
          }
        }
      })
    ]);

    res.json({
      stats: {
        totalItems,
        lowStockItems,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      },
      recentActivities
    });
  } catch (error) {
    next(error);
  }
});

// Get inventory overview
router.get('/inventory', authenticateToken, async (req, res, next) => {
  try {
    const inventoryByCategory = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            items: true
          }
        },
        items: {
          select: {
            quantity: true,
            price: true
          }
        }
      }
    });

    const inventoryData = inventoryByCategory.map(category => ({
      category: category.name,
      itemCount: category._count.items,
      totalValue: category.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      totalQuantity: category.items.reduce((sum, item) => sum + item.quantity, 0)
    }));

    res.json(inventoryData);
  } catch (error) {
    next(error);
  }
});

export { router as dashboardRoutes };