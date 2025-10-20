import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { createResponse } from '../utils/apiResponse';
import { z } from 'zod';

/**
 * Handle payment success callback from Polar
 */
export async function handlePaymentSuccess(req: Request, res: Response): Promise<void> {
  try {
    const { checkout_id } = z.object({
      checkout_id: z.string()
    }).parse(req.query);

    // For signup payments, we need to get user ID from checkout metadata
    // This would typically come from Polar webhook, but for demo we'll handle it here
    const userId = req.user?.id; // Assuming user is authenticated

    if (!userId) {
      res.status(400).json(
        createResponse({ 
          success: false, 
          message: "User not found" 
        })
      );
      return;
    }

    await PaymentService.handleSignupPayment(checkout_id, userId);

    res.status(200).json(
      createResponse({
        data: { checkoutId: checkout_id },
        message: "Payment processed successfully. Your account is now active!"
      })
    );

  } catch (error) {
    res.status(500).json(
      createResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : "Payment processing failed" 
      })
    );
  }
}

/**
 * Handle Polar webhooks
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature (in production)
    // const signature = req.headers['polar-signature'];
    // if (!verifyWebhookSignature(webhookData, signature)) {
    //   res.status(401).json({ error: 'Invalid signature' });
    //   return;
    // }

    await PaymentService.handleWebhook(webhookData);

    res.status(200).json({ received: true });

  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Webhook processing failed" 
    });
  }
}

/**
 * Create payment for order
 */
export async function createPayment(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, amount, currency, description, metadata } = z.object({
      orderId: z.string(),
      amount: z.number().positive(),
      currency: z.string().optional(),
      description: z.string().optional(),
      metadata: z.record(z.any()).optional()
    }).parse(req.body);

    const payment = await PaymentService.createPayment({
      orderId,
      amount,
      currency,
      description,
      metadata
    });

    res.status(201).json(
      createResponse({
        data: payment,
        message: "Payment created successfully"
      })
    );

  } catch (error) {
    res.status(500).json(
      createResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : "Payment creation failed" 
      })
    );
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { paymentId } = z.object({
      paymentId: z.string()
    }).parse(req.params);

    const payment = await PaymentService.getPaymentStatus(paymentId);

    res.status(200).json(
      createResponse({
        data: payment,
        message: "Payment status retrieved successfully"
      })
    );

  } catch (error) {
    res.status(500).json(
      createResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to get payment status" 
      })
    );
  }
}