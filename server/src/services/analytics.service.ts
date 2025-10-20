import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

export interface AnalyticsParams {
  from?: Date;
  to?: Date;
}

export class AnalyticsService {
  static async getSummary(params: AnalyticsParams) {
    // For now, return mock data to test the analytics page rendering
    // TODO: Replace with real database queries once data is seeded
    const mockData = {
      totalRevenueCents: 12589900, // $125,899
      totalOrders: 42,
      averageOrderValueCents: 299759, // $2,997.59
      inventory: {
        totalItems: 8,
        totalStockQuantity: 163,
        lowStockCount: 3
      },
      popularProducts: [
        { id: '1', name: 'Wireless Headphones', sku: 'WH-001', quantitySold: 15, percent: 35.7 },
        { id: '2', name: 'Gaming Keyboard', sku: 'GK-002', quantitySold: 8, percent: 19.0 },
        { id: '3', name: 'Office Chair', sku: 'OC-003', quantitySold: 6, percent: 14.3 },
        { id: '4', name: 'Desk Lamp', sku: 'DL-004', quantitySold: 5, percent: 11.9 },
        { id: '5', name: 'Water Bottle', sku: 'WB-005', quantitySold: 8, percent: 19.0 }
      ],
      inventoryTurnover: 2.3,
      monthlySales: [
        { month: '2024-06', revenueCents: 2450000, orders: 8 },
        { month: '2024-07', revenueCents: 3200000, orders: 12 },
        { month: '2024-08', revenueCents: 2890000, orders: 9 },
        { month: '2024-09', revenueCents: 4049900, orders: 13 }
      ],
      monthlyTurnover: [
        { month: '2024-06', turnover: 1.8 },
        { month: '2024-07', turnover: 2.1 },
        { month: '2024-08', turnover: 2.0 },
        { month: '2024-09', turnover: 2.3 }
      ],
      supplierPerformance: [], // placeholder
      generatedAt: new Date().toISOString()
    };

    return mockData;
  }
}