// Global type definitions for the warehouse management system

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string> | string;
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'admin' | 'user';
  name?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  _count?: {
    items: number;
  };
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  recentUsers: number;
}

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

export interface PaginatedResponse<T> {
  items?: T[];
  orders?: T[];
  shipments?: T[];
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

export interface UpdateItemData extends Partial<CreateItemData> {}

export interface UpdateUserData {
  email?: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  quantity: number;
  priceCents: number;
  item: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderItem {
  itemId: string;
  quantity: number;
}

export interface DashboardStats {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
}

export interface Alert {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  priceCents: number;
}

export type ShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  orderId: string;
  carrierName?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  order?: Order;
}

export interface CreateShipmentData {
  orderId: string;
  carrierName?: string;
  estimatedDelivery?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string> | string;
    };
    status?: number;
  };
  message?: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
}