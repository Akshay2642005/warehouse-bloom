import { axiosInstance } from './axiosInstance';
import { ApiResponse } from './auth';
import { Item } from './items';

export interface DashboardStats {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
}

export interface Alert {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  priceCents: number;
}

/**
 * Fetches dashboard statistics.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  return response.data.data!;
}

/**
 * Fetches low stock alerts.
 */
export async function fetchAlerts(): Promise<Item[]> {
  const response = await axiosInstance.get<ApiResponse<{ alerts: Item[] }>>('/dashboard/alerts');
  return response.data.data!.alerts;
}