import apiClient from '@/lib/axios';

/**
 * Re-export the configured axios instance from lib/axios
 * This ensures all API calls use the same instance with organization interceptors
 */
export const axiosInstance = apiClient;
