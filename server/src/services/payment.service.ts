import axios from 'axios';
import { prisma } from '../utils/prisma';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

export interface CreatePaymentData {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentWebhookData {
  id: string;
  type: string;
  data: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Polar Payment Service for handling payments integration
 */
export class PaymentService {
  private static readonly POLAR_API_BASE = config.POLAR_ENVIRONMENT === 'production' 
    ? 'https://api.polar.sh' 
    : 'https://sandbox-api.polar.sh';

  /**
   * Create signup payment for new user
   */
  static async createSignupPayment(userId: string, plan: string = 'BASIC') {
    try {
      const amount = 2900; // $29.00 single plan

      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      const response = await axios.post(
        `${this.POLAR_API_BASE}/v1/checkouts`,
        {
          product_id: config.POLAR_PRODUCT_ID || 'prod_basic',
          success_url: config.POLAR_SUCCESS_URL || 'http://localhost:8000/success?checkout_id={CHECKOUT_ID}',
          customer_email: user?.email,
          metadata: {
            userId,
            plan,
            type: 'signup'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.POLAR_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Signup payment created', {
        userId,
        plan,
        checkoutId: response.data.id
      });

      return {
        checkoutId: response.data.id,
        checkoutUrl: response.data.url,
        amount
      };

    } catch (error) {
      logger.error('Failed to create signup payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        plan
      });
      throw error;
    }
  }

  /**
   * Create a payment intent with Polar
   */
  static async createPayment(data: CreatePaymentData) {
    try {
      if (!config.POLAR_ACCESS_TOKEN) {
        throw new Error('Polar access token not configured');
      }

      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: { user: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          orderId: data.orderId,
          amount: data.amount,
          currency: data.currency || 'USD',
          status: 'PENDING',
          provider: 'polar',
          metadata: data.metadata
        }
      });

      // Create payment intent with Polar
      const polarResponse = await axios.post(
        `${this.POLAR_API_BASE}/v1/payments`,
        {
          amount: data.amount,
          currency: data.currency || 'USD',
          description: data.description || `Payment for order ${order.orderNumber}`,
          metadata: {
            ...data.metadata,
            orderId: data.orderId,
            paymentId: payment.id,
            userId: order.userId
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.POLAR_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update payment with Polar payment ID
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: polarResponse.data.id,
          metadata: {
            ...payment.metadata as object,
            polarData: polarResponse.data
          }
        }
      });

      logger.info('Payment created successfully', {
        paymentId: payment.id,
        orderId: data.orderId,
        polarPaymentId: polarResponse.data.id
      });

      return {
        payment: updatedPayment,
        clientSecret: polarResponse.data.client_secret,
        paymentUrl: polarResponse.data.url
      };

    } catch (error) {
      logger.error('Failed to create payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: data.orderId
      });
      throw error;
    }
  }

  /**
   * Handle signup payment completion
   */
  static async handleSignupPayment(checkoutId: string, userId: string) {
    try {
      // Activate user's tenant
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true }
      });

      if (!user || !user.tenant) {
        throw new Error('User or tenant not found');
      }

      // Import tenant service
      const { TenantService } = await import('./tenant.service');
      await TenantService.activateTenant(user.tenant.id);

      // Update user as active
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true }
      });

      logger.info('Signup payment completed', {
        userId,
        tenantId: user.tenant.id,
        checkoutId
      });

      return { success: true };

    } catch (error) {
      logger.error('Failed to handle signup payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        checkoutId
      });
      throw error;
    }
  }

  /**
   * Handle Polar webhook events
   */
  static async handleWebhook(webhookData: PaymentWebhookData) {
    try {
      const { type, data: paymentData } = webhookData;

      // Find payment by Polar payment ID
      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId: paymentData.id },
        include: { order: true }
      });

      if (!payment) {
        logger.warn('Payment not found for webhook', { polarPaymentId: paymentData.id });
        return;
      }

      let newStatus: string;
      switch (type) {
        case 'payment.succeeded':
          newStatus = 'COMPLETED';
          break;
        case 'payment.failed':
          newStatus = 'FAILED';
          break;
        case 'payment.cancelled':
          newStatus = 'CANCELLED';
          break;
        case 'payment.refunded':
          newStatus = 'REFUNDED';
          break;
        default:
          logger.info('Unhandled webhook type', { type, paymentId: payment.id });
          return;
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus as any,
          metadata: {
            ...payment.metadata as object,
            webhookData: paymentData
          }
        }
      });

      // Update order status if payment completed
      if (newStatus === 'COMPLETED') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'PROCESSING' }
        });

        logger.info('Payment completed, order updated', {
          paymentId: payment.id,
          orderId: payment.orderId
        });
      }

      logger.info('Webhook processed successfully', {
        type,
        paymentId: payment.id,
        newStatus
      });

    } catch (error) {
      logger.error('Failed to process webhook', {
        error: error instanceof Error ? error.message : 'Unknown error',
        webhookData
      });
      throw error;
    }
  }

  /**
   * Get payment status from Polar
   */
  static async getPaymentStatus(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment || !payment.providerPaymentId) {
        throw new Error('Payment not found');
      }

      const response = await axios.get(
        `${this.POLAR_API_BASE}/v1/payments/${payment.providerPaymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.POLAR_ACCESS_TOKEN}`
          }
        }
      );

      return {
        payment,
        polarData: response.data
      };

    } catch (error) {
      logger.error('Failed to get payment status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId
      });
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  static async refundPayment(paymentId: string, amount?: number) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment || !payment.providerPaymentId) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'COMPLETED') {
        throw new Error('Can only refund completed payments');
      }

      const refundAmount = amount || payment.amount;

      const response = await axios.post(
        `${this.POLAR_API_BASE}/v1/payments/${payment.providerPaymentId}/refund`,
        {
          amount: refundAmount,
          reason: 'requested_by_customer'
        },
        {
          headers: {
            'Authorization': `Bearer ${config.POLAR_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          metadata: {
            ...payment.metadata as object,
            refundData: response.data
          }
        }
      });

      logger.info('Payment refunded successfully', {
        paymentId,
        refundAmount,
        polarRefundId: response.data.id
      });

      return response.data;

    } catch (error) {
      logger.error('Failed to refund payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId
      });
      throw error;
    }
  }

  /**
   * List payments for an order
   */
  static async getOrderPayments(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get payment analytics
   */
  static async getPaymentAnalytics(startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        order: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      }
    });

    const analytics = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: payments.filter(p => p.status === 'COMPLETED').length,
      failedPayments: payments.filter(p => p.status === 'FAILED').length,
      pendingPayments: payments.filter(p => p.status === 'PENDING').length,
      refundedPayments: payments.filter(p => p.status === 'REFUNDED').length,
      averageAmount: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      paymentsByStatus: payments.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return analytics;
  }
}