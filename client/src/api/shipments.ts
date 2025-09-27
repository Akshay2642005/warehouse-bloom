import { axiosInstance } from './axiosInstance';
import { ApiResponse } from './auth';

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  destination: string;
  status: string;
  shippedDate?: string;
  estimatedDelivery?: string;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
  };
}

export interface CreateShipmentData {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  destination: string;
  estimatedDelivery?: string;
}

export async function fetchShipments(): Promise<{ shipments: Shipment[] }> {
  const response = await axiosInstance.get<ApiResponse<{ shipments: Shipment[] }>>('/shipments');
  return response.data.data!;
}

export async function createShipmentApi(data: CreateShipmentData): Promise<Shipment> {
  const response = await axiosInstance.post<ApiResponse<{ shipment: Shipment }>>('/shipments', data);
  return response.data.data!.shipment;
}

export async function updateShipmentStatusApi(id: string, status: string): Promise<void> {
  await axiosInstance.put(`/shipments/${id}/status`, { status });
}