import axios, { AxiosError, AxiosResponse } from 'axios';

interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Enhanced Axios instance with comprehensive error handling and retry logic.
 */
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for authentication and request logging
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for performance monitoring
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata?.startTime) {
      const duration = new Date().getTime() - response.config.metadata.startTime.getTime();
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle different error scenarios
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      switch (status) {
        case 401:
          // Clear auth data and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          
          // Avoid infinite redirect loop
          if (!window.location.pathname.startsWith('/login') && 
              !window.location.pathname.startsWith('/signup')) {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden - show appropriate message
          console.error('Access forbidden:', data.message || 'Insufficient permissions');
          break;
          
        case 429:
          // Rate limited - could implement retry with backoff
          console.warn('Rate limited:', data.message || 'Too many requests');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors - could implement retry logic
          console.error('Server error:', status, data.message || 'Internal server error');
          break;
          
        default:
          console.error('API error:', status, data.message || 'Unknown error');
      }
      
      // Enhance error object with structured data
      const apiError: ApiError = {
        message: data.message || data.error || `HTTP ${status} Error`,
        code: data.code || `HTTP_${status}`,
        details: data.details || data
      };
      
      error.apiError = apiError;
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
      error.apiError = {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      error.apiError = {
        message: 'Request configuration error',
        code: 'REQUEST_ERROR'
      };
    }
    
    return Promise.reject(error);
  }
);

// Utility functions for common API patterns
export const apiUtils = {
  /**
   * Extract error message from API error
   */
  getErrorMessage: (error: any): string => {
    if (error.apiError) {
      return error.apiError.message;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
  
  /**
   * Check if error is a specific type
   */
  isErrorType: (error: any, code: string): boolean => {
    return error.apiError?.code === code || error.response?.status?.toString() === code;
  },
  
  /**
   * Retry a request with exponential backoff
   */
  retryRequest: async <T>(requestFn: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (i === maxRetries) {
          throw error;
        }
        
        // Wait with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
};

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
  
  interface AxiosError {
    apiError?: ApiError;
  }
}
