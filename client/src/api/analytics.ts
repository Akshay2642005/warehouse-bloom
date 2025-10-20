import { axiosInstance } from './axiosInstance';

export interface AnalyticsSummary {
  totalRevenueCents: number;
  totalOrders: number;
  averageOrderValueCents: number;
  inventory: {
    totalItems: number;
    totalStockQuantity: number;
    lowStockCount: number;
  };
  popularProducts: Array<{
    id: string;
    name: string;
    sku: string;
    quantitySold: number;
    percent: number;
  }>;
  inventoryTurnover: number;
  monthlySales: Array<{ month: string; revenueCents: number; orders: number }>;
  monthlyTurnover: Array<{ month: string; turnover: number }>;
  supplierPerformance: any[]; // placeholder
  generatedAt: string;
}

export async function fetchAnalyticsSummary(params?: { from?: string; to?: string }) {
  const res = await axiosInstance.get<{ success: boolean; data: AnalyticsSummary }>('/analytics/summary', { params });
  return res.data.data;
}
