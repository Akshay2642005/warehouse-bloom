import { axiosInstance } from './axiosInstance';

export interface OrderItemDTO {
  itemId: string;
  quantity: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: Array<{ id: string; quantity: number; priceCents: number; item: { id: string; name: string; sku: string } }>
}

export interface PaginatedOrders {
  orders: OrderDTO[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function fetchOrders(params?: { page?: number; pageSize?: number }): Promise<PaginatedOrders> {
  const response = await axiosInstance.get<{ success: boolean; data: PaginatedOrders }>('/orders', { params });
  return response.data.data;
}

export async function createOrderApi(items: OrderItemDTO[]): Promise<OrderDTO> {
  const response = await axiosInstance.post<{ success: boolean; data: { order: OrderDTO } }>('/orders', { items });
  return response.data.data.order;
}

export async function updateOrderStatusApi(id: string, status: OrderDTO['status']): Promise<void> {
  await axiosInstance.put(`/orders/${id}/status`, { status });
} 