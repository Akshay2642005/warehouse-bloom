import nodemailer from 'nodemailer';
import { prisma } from '../utils/prisma';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }

  async sendLowStockAlert(item: any, users: string[]): Promise<void> {
    const subject = `Low Stock Alert: ${item.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Low Stock Alert</h2>
        <p>The following item is running low on stock:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${item.name}</h3>
          <p><strong>SKU:</strong> ${item.sku}</p>
          <p><strong>Current Stock:</strong> ${item.quantity}</p>
          <p><strong>Price:</strong> $${(item.priceCents / 100).toFixed(2)}</p>
        </div>
        <p>Please restock this item as soon as possible.</p>
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Warehouse Management System.
        </p>
      </div>
    `;

    for (const email of users) {
      await this.sendEmail({ to: email, subject, html });
    }
  }

  async sendOrderStatusUpdate(order: any, userEmail: string): Promise<void> {
    const subject = `Order Update: ${order.orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Order Status Update</h2>
        <p>Your order status has been updated:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Order #${order.orderNumber}</h3>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total:</strong> $${(order.totalCents / 100).toFixed(2)}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Warehouse Management System.
        </p>
      </div>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }
}

export const emailService = new EmailService();