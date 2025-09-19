import { axiosInstance } from './axiosInstance';
import { ApiResponse } from './auth';

export interface Item {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  priceCents: number;
  imageUrl?: string;
  description?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface PaginatedItems { 
  items: Item[]; 
  page: number; 
  pageSize: number; 
  total: number;
  totalPages: number;
}

export interface CreateItemData {
  name: string;
  sku: string;
  quantity: number;
  priceCents: number;
  imageUrl?: string;
  description?: string;
}

/**
 * Fetches a paginated list of items.
 */
export async function fetchItems(params?: { page?: number; pageSize?: number; q?: string }): Promise<PaginatedItems> {
  const response = await axiosInstance.get<ApiResponse<PaginatedItems>>('/items', { params });
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
export async function updateItemByIdApi(id: string, data: Partial<CreateItemData>): Promise<Item> {
  const response = await axiosInstance.put<ApiResponse<{ item: Item }>>(`/items/${id}`, data);
  return response.data.data!.item;
}

/**
 * Deletes an item by id.
 */
export async function deleteItemByIdApi(id: string): Promise<void> {
  await axiosInstance.delete(`/items/${id}`);
} 