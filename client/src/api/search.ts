import { axiosInstance } from './axiosInstance';
import type { ApiResponse, PaginatedResponse } from '@/types';

export interface SearchParams {
  q?: string;
  type?: 'items' | 'orders';
  page?: number;
  pageSize?: number;
  status?: string;
  sortBy?: string;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Universal search function with caching
 */
export async function searchApi<T = any>(params: SearchParams): Promise<SearchResult<T>> {
  const response = await axiosInstance.get<ApiResponse<SearchResult<T>>>('/search', { 
    params,
    // Enable client-side caching
    headers: {
      'Cache-Control': 'max-age=30'
    }
  });
  return response.data.data!;
}