import { axiosInstance, apiUtils } from './axiosInstance';

export interface CreatePaymentData {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  provider: string;
  providerPaymentId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  payment: Payment;
  clientSecret?: string;
  paymentUrl?: string;
}

export interface PaymentAnalytics {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  failedPayments: number;
  pendingPayments: number;
  refundedPayments: number;
  averageAmount: number;
  paymentsByStatus: Record<string, number>;
}

/**
 * Payment API client with comprehensive error handling
 */
export const paymentsApi = {
  /**
   * Create a new payment
   */
  async createPayment(data: CreatePaymentData): Promise<PaymentResponse> {
    try {
      const response = await axiosInstance.post('/payments', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create payment:', apiUtils.getErrorMessage(error));
      throw error;
    }
  },

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{ payment: Payment; polarData?: any }> {
    try {
      const response = await axiosInstance.get(`/payments/${paymentId}/status`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get payment status:', apiUtils.getErrorMessage(error));
      throw error;
    }
  },

  /**
   * Refund a payment (admin only)
   */
  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const response = await axiosInstance.post(`/payments/${paymentId}/refund`, { amount });
      return response.data.data;
    } catch (error) {
      console.error('Failed to refund payment:', apiUtils.getErrorMessage(error));
      throw error;
    }
  },

  /**
   * Get payments for an order
   */
  async getOrderPayments(orderId: string): Promise<Payment[]> {
    try {
      const response = await axiosInstance.get(`/payments/order/${orderId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get order payments:', apiUtils.getErrorMessage(error));
      throw error;
    }
  },

  /**
   * Get payment analytics (admin only)
   */
  async getPaymentAnalytics(startDate?: string, endDate?: string): Promise<PaymentAnalytics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axiosInstance.get(`/payments/analytics?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get payment analytics:', apiUtils.getErrorMessage(error));
      throw error;
    }
  },

  /**
   * Retry failed payment with exponential backoff
   */
  async retryPayment(paymentId: string): Promise<PaymentResponse> {
    return apiUtils.retryRequest(async () => {
      const response = await axiosInstance.post(`/payments/${paymentId}/retry`);
      return response.data.data;
    });
  }
};