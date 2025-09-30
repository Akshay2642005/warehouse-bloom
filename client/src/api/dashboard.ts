import { axiosInstance } from './axiosInstance';
import type { ApiResponse, Item, DashboardStats, Alert } from '@/types';

export type { DashboardStats, Alert };

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