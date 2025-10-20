import { axiosInstance, apiUtils } from './axiosInstance';

export interface SearchFilters {
  categoryId?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface SearchOptions {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: SearchFilters;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Search API client with advanced filtering and suggestions
 */
export const searchApi = {
  /**
   * Search items with advanced filtering
   */
  async searchItems(options: SearchOptions): Promise<SearchResult<any>> {
    try {
      const params = new URLSearchParams();
      
      if (options.query) params.append('query', options.query);
      if (options.page) params.append('page', options.page.toString());
      if (options.pageSize) params.append('pageSize', options.pageSize.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      
      // Add filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axiosInstance.get(`/search/items?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to search items:', apiUtils.getErrorMessage(error));
      throw error;
    }
  },

  /**
   * Search orders
   */
  async searchOrders(options: SearchOptions): Promise<SearchResult<any>> {
    try {
      const params = new URLSearchParams();
      
      if (options.query) params.append('query', options.query);
      if (options.page) params.append('page', options.page.toString());
      if (options.pageSize) params.append('pageSize', options.pageSize.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await axiosInstance.get(`/search/orders?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to search orders:', apiUtils.getErrorMessage(error));
      throw error;
    }
  },

  /**
   * Get search suggestions for autocomplete
   */
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      if (!query || query.length < 2) return [];
      
      const response = await axiosInstance.get(`/search/suggestions`, {
        params: { query, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get suggestions:', apiUtils.getErrorMessage(error));
      return [];
    }
  },

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit: number = 10): Promise<Array<{ term: string; count: number }>> {
    try {
      const response = await axiosInstance.get(`/search/popular`, {
        params: { limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get popular searches:', apiUtils.getErrorMessage(error));
      return [];
    }
  }
};