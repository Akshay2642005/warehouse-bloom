import { axiosInstance } from './axiosInstance';
import type { ApiResponse, Shipment, CreateShipmentData, PaginatedResponse, QueryParams } from '@/types';

export type { Shipment, CreateShipmentData };

export async function fetchShipments(params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Shipment>> {
  const cleanParams = {
    page: params?.page || 1,
    pageSize: params?.pageSize || 10
  };
  const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Shipment>>>('/shipments', { params: cleanParams });
  return response.data.data!;
}

export async function createShipmentApi(data: CreateShipmentData): Promise<Shipment> {
  const response = await axiosInstance.post<ApiResponse<{ shipment: Shipment }>>('/shipments', data);
  return response.data.data!.shipment;
}

export async function updateShipmentStatusApi(id: string, status: Shipment['status']): Promise<void> {
  await axiosInstance.put(`/shipments/${id}/status`, { status });
}