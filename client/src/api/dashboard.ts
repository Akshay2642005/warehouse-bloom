import { axiosInstance } from './axiosInstance';
import type { ApiResponse, Item, DashboardStats, Alert, DashboardActivity, InventoryCategoryRow } from '@/types';

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

/**
 * Fetch recent dashboard activities (orders, shipments, inventory logs unified)
 */
export async function fetchDashboardActivities(): Promise<DashboardActivity[]> {
  const response = await axiosInstance.get<ApiResponse<{ activities: DashboardActivity[] }>>('/dashboard/activities');
  return response.data.data?.activities || [];
}

/**
 * Fetch inventory-by-category stacked chart data
 */
export async function fetchInventoryCategoryChart(): Promise<InventoryCategoryRow[]> {
  const response = await axiosInstance.get<ApiResponse<{ inventoryByCategory: InventoryCategoryRow[] }>>('/dashboard/charts/inventory');
  return response.data.data?.inventoryByCategory || [];
}