import { prisma } from '../utils/prisma';
import { emailService } from './email.service';
import { Severity } from '@prisma/client';

export class AlertService {
  static async createLowStockAlert(itemId: string, quantity: number): Promise<void> {
    try {
      // Get low stock threshold from settings
      const thresholdSetting = await prisma.systemSetting.findUnique({
        where: { key: 'lowStockThreshold' }
      });
      const threshold = parseInt(thresholdSetting?.value || '10');

      if (quantity <= threshold) {
        // Check if alert already exists for this item
        const existingAlert = await prisma.alert.findFirst({
          where: {
            itemId,
            type: 'LOW_STOCK',
            acknowledged: false
          }
        });

        if (!existingAlert) {
          // Get item details
          const item = await prisma.item.findUnique({
            where: { id: itemId }
          });

          if (item) {
            // Create alert
            const severity: Severity = quantity === 0 ? Severity.CRITICAL : quantity <= 5 ? Severity.HIGH : quantity <= threshold ? Severity.MEDIUM : Severity.LOW;
            await prisma.alert.create({
              data: {
                type: 'LOW_STOCK',
                message: `${item.name} is running low (${quantity} remaining)`,
                itemId,
                severity,
                new: true
              }
            });

            // Send email notifications to users who have enabled low stock alerts
            const usersWithAlerts = await prisma.systemSetting.findMany({
              where: {
                key: { endsWith: ':lowStockAlerts' },
                value: '1'
              }
            });

            const userIds = usersWithAlerts.map(setting => 
              setting.key.replace('user:', '').replace(':lowStockAlerts', '')
            );

            const users = await prisma.user.findMany({
              where: { id: { in: userIds } },
              select: { email: true }
            });

            const emails = users.map(user => user.email);
            if (emails.length > 0) {
              await emailService.sendLowStockAlert(item, emails);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to create low stock alert:', error);
    }
  }

  static async createOrderAlert(orderId: string, status: string): Promise<void> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
      });

      if (order) {
        await prisma.alert.create({
          data: {
            type: 'ORDER_STATUS_CHANGED',
            message: `Order ${order.orderNumber} status changed to ${status}`,
            severity: Severity.LOW,
            new: true
          }
        });

        // Check if user has order update notifications enabled
        const userSetting = await prisma.systemSetting.findUnique({
          where: { key: `user:${order.userId}:orderUpdates` }
        });

        if (userSetting?.value === '1') {
          await emailService.sendOrderStatusUpdate(order, order.user.email);
        }
      }
    } catch (error) {
      console.error('Failed to create order alert:', error);
    }
  }

  static async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      const alert = await prisma.alert.findUnique({
        where: { id: alertId }
      });
      
      if (!alert) {
        return false;
      }
      
      await prisma.alert.update({
        where: { id: alertId },
        data: { acknowledged: true, new: false }
      });
      return true;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      return false;
    }
  }

  static async markAlertAsRead(alertId: string): Promise<boolean> {
    try {
      await prisma.alert.update({
        where: { id: alertId },
        data: { new: false }
      });
      return true;
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
      return false;
    }
  }

  static async markAllAlertsAsRead(): Promise<boolean> {
    try {
      await prisma.alert.updateMany({
        where: { new: true },
        data: { new: false }
      });
      return true;
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
      return false;
    }
  }

  static async checkAllItemsForLowStock(): Promise<void> {
    try {
      const threshold = 10;
      const lowStockItems = await prisma.item.findMany({
        where: {
          quantity: { lte: threshold }
        }
      });

      for (const item of lowStockItems) {
        await this.createLowStockAlert(item.id, item.quantity);
      }
    } catch (error) {
      if ((error as any)?.code === 'P2021') {
        // Table missing (likely schema not pushed yet) – log at warn level and swallow
        console.warn('Skipping low stock scan: database schema not applied yet (P2021)');
        return;
      }
      console.error('Failed to check items for low stock:', error);
    }
  }
}