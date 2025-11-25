export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  role?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  role?: OrgRole; // Current user's role in this org
}

export enum OrgRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrgRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface Category {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  organizationId: string;
  categoryId?: string;
  supplierId?: string;
  name: string;
  sku: string;
  description?: string;
  quantity: number;
  minQuantity: number;
  priceCents: number;
  imageUrl?: string;
  barcode?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  supplier?: Supplier;
}

export interface Order {
  id: string;
  organizationId: string;
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  shipments?: Shipment[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  priceCents: number;
  item?: Item;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Shipment {
  id: string;
  organizationId: string;
  orderId: string;
  carrier: string;
  trackingNumber?: string;
  status: ShipmentStatus;
  destination: string;
  shippedDate?: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export interface Alert {
  id: string;
  organizationId: string;
  itemId?: string;
  type: AlertType;
  severity: Severity;
  message: string;
  acknowledged: boolean;
  createdAt: string;
  updatedAt: string;
  item?: Item;
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  SHIPMENT_DELAYED = 'SHIPMENT_DELAYED',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type CreateItemData = Omit<Item, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'category' | 'supplier'>;
export type UpdateItemData = Partial<CreateItemData>;

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  lowStock?: boolean;
  [key: string]: any;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}