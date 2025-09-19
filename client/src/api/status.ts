import { axiosInstance } from './axiosInstance';
import { ApiResponse } from './auth';

export interface SystemStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: string;
      latency: string;
    };
    redis: {
      status: string;
      latency: string;
    };
  };
  stats: {
    totalUsers: number;
    totalItems: number;
  };
  responseTime: string;
}

export interface SystemMetrics {
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    memory: {
      used: string;
      total: string;
      external: string;
    };
  };
  database: {
    users: {
      total: number;
      byRole: Record<string, number>;
    };
    items: {
      total: number;
      totalQuantity: number;
      totalValue: number;
      averageQuantity: number;
      averagePrice: number;
      lowStockItems: number;
    };
  };
}

/**
 * Get system status and health check
 */
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const response = await axiosInstance.get<ApiResponse<SystemStatus>>('/status');
  return response.data.data!;
}

/**
 * Get detailed system metrics (requires authentication)
 */
export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const response = await axiosInstance.get<ApiResponse<SystemMetrics>>('/status/metrics');
  return response.data.data!;
}