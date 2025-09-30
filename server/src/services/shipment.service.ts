import { prisma } from '../utils/prisma';
import { OrderStatus } from '@prisma/client';
import { SearchService } from './search.service';
import { logger } from '../utils/logger';

export class ShipmentService {
  static async createShipment(data: {
    orderId: string;
    carrier: string;
    trackingNumber: string;
    destination: string;
    estimatedDelivery?: Date;
  }) {
    return await prisma.$transaction(async (tx) => {
      // Create shipment
      const shipment = await tx.shipment.create({
        data: {
          ...data,
          status: 'Processing',
          shippedDate: new Date()
        },
        include: { order: { select: { id: true, orderNumber: true } } }
      });

      // Update order status to SHIPPED
      await tx.order.update({
        where: { id: data.orderId },
        data: { status: OrderStatus.SHIPPED }
      });

      logger.info(`Order ${data.orderId} automatically set to SHIPPED`);
      
      // Invalidate cache
      await SearchService.invalidateCache('orders');
      
      return shipment;
    });
  }

  static async updateShipmentStatus(id: string, status: string) {
    return await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.update({
        where: { id },
        data: { status },
        include: { 
          order: { 
            include: { 
              items: { 
                include: { item: true } 
              } 
            } 
          } 
        }
      });

      // Sync order status based on shipment status
      let orderStatus: OrderStatus | null = null;
      
      if (status === 'Delivered') {
        orderStatus = OrderStatus.DELIVERED;
      } else if (status === 'Failed' || status === 'Returned' || status === 'Cancelled') {
        orderStatus = OrderStatus.CANCELLED;
        
        // Restore inventory for cancelled orders
        for (const orderItem of shipment.order.items) {
          await tx.item.update({
            where: { id: orderItem.itemId },
            data: { quantity: { increment: orderItem.quantity } }
          });
        }
        logger.info(`Inventory restored for cancelled order ${shipment.orderId}`);
      }

      if (orderStatus) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: orderStatus }
        });
        logger.info(`Order ${shipment.orderId} status synced to ${orderStatus}`);
      }

      // Invalidate cache
      await SearchService.invalidateCache('orders');
      await SearchService.invalidateCache('items');
      
      return shipment;
    });
  }
}