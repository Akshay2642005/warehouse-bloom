import { axiosInstance } from './axiosInstance';

export async function acknowledgeAlert(id: string): Promise<void> {
  await axiosInstance.post(`/alerts/${id}/ack`);
}

export async function restockItem(itemId: string, amount: number): Promise<void> {
  await axiosInstance.post(`/alerts/${itemId}/restock`, { amount });
} 