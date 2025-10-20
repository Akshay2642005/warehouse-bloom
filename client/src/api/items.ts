import { axiosInstance } from './axiosInstance';
import type { ApiResponse, Item, PaginatedResponse, CreateItemData, UpdateItemData, QueryParams } from '@/types';

export type { Item, CreateItemData };

/**
 * Fetches a paginated list of items.
 */
export async function fetchItems(params?: QueryParams): Promise<PaginatedResponse<Item>> {
  const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Item>>>('/items', { params });
  return response.data.data!;
}

/**
 * Creates a new item.
 */
export async function createItemApi(data: CreateItemData): Promise<Item> {
  const response = await axiosInstance.post<ApiResponse<{ item: Item }>>('/items', data);
  return response.data.data!.item;
}

/**
 * Fetches a single item by id.
 */
export async function fetchItemById(id: string): Promise<Item> {
  const response = await axiosInstance.get<ApiResponse<{ item: Item }>>(`/items/${id}`);
  return response.data.data!.item;
}

/**
 * Updates an item by id.
 */
export async function updateItemByIdApi(id: string, data: UpdateItemData): Promise<Item> {
  const response = await axiosInstance.put<ApiResponse<{ item: Item }>>(`/items/${id}`, data);
  return response.data.data!.item;
}

/**
 * Deletes an item by id.
 */
export async function deleteItemByIdApi(id: string): Promise<void> {
  await axiosInstance.delete(`/items/${id}`);
} 