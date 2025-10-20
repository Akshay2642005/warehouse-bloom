// Simple analytics API - will be enhanced when backend is ready
export const analyticsApi = {
  getDashboardOverview: async () => {
    // Mock data for now
    return {
      inventory: {
        totalItems: 100,
        activeItems: 89,
        lowStockItems: 5,
        outOfStockItems: 2
      },
      sales: {
        totalOrders: 156,
        totalRevenue: 1234500,
        averageOrderValue: 7915
      },
      recentActivity: []
    };
  },

  getInventoryAnalytics: async () => {
    return {
      totalItems: 100,
      activeItems: 89,
      lowStockItems: 5,
      outOfStockItems: 2,
      topCategories: []
    };
  },

  getSalesAnalytics: async () => {
    return {
      totalOrders: 156,
      totalRevenue: 1234500,
      averageOrderValue: 7915,
      dailySales: [],
      topProducts: []
    };
  }
};