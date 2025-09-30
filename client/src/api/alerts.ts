import { axiosInstance } from './axiosInstance';
import type { ApiResponse, Alert } from '@/types';

export type { Alert };

/**
 * Fetch all alerts
 */
export async function fetchAlerts(): Promise<Alert[]> {
  const response = await axiosInstance.get<ApiResponse<{ alerts: Alert[] }>>('/alerts');
  return response.data.data?.alerts || [];
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  await axiosInstance.put(`/alerts/${alertId}/acknowledge`);
}

/**
 * Restock an item (creates new stock)
 */
export async function restockItem(itemId: string, amount: number): Promise<void> {
  await axiosInstance.post(`/items/${itemId}/restock`, { amount });
}

/**
 * Create a new alert
 */
export async function createAlert(data: {
  type: string;
  message: string;
  itemId?: string;
  severity?: string;
}): Promise<Alert> {
  const response = await axiosInstance.post<ApiResponse<{ alert: Alert }>>('/alerts', data);
  return response.data.data!.alert;
}

/**
 * Delete an alert
 */
export async function deleteAlert(alertId: string): Promise<void> {
  await axiosInstance.delete(`/alerts/${alertId}`);
}