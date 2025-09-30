import { axiosInstance } from './axiosInstance';

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: string;
  environment: string;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      latency: string;
    };
    redis: {
      status: 'connected' | 'disconnected';
      latency: string;
    };
  };
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
      lowStockItems: number;
    };
  };
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const response = await axiosInstance.get('/system/status');
  return response.data.data;
}

export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const response = await axiosInstance.get('/system/metrics');
  return response.data.data;
}