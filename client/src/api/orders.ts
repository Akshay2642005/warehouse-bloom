import { axiosInstance } from './axiosInstance';
import type { Order, OrderStatus, CreateOrderItem, PaginatedResponse, QueryParams } from '@/types';

export type { Order, OrderStatus, CreateOrderItem };

export async function fetchOrders(params?: QueryParams): Promise<PaginatedResponse<Order>> {
  const response = await axiosInstance.get<{ success: boolean; data: PaginatedResponse<Order> }>('/orders', { params });
  return response.data.data;
}

export async function createOrderApi(items: CreateOrderItem[]): Promise<Order> {
  const response = await axiosInstance.post<{ success: boolean; data: { order: Order } }>('/orders', { items });
  return response.data.data.order;
}

export async function updateOrderStatusApi(id: string, status: OrderStatus): Promise<void> {
  await axiosInstance.put(`/orders/${id}/status`, { status });
} 