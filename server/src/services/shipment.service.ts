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
    const shipment = await prisma.shipment.create({
      data: {
        ...data,
        status: 'Processing',
        shippedDate: new Date()
      },
      include: { order: { select: { id: true, orderNumber: true } } }
    });

    // Invalidate cache
    await SearchService.invalidateCache('orders');
    
    return shipment;
  }

  static async updateShipmentStatus(id: string, status: string) {
    const shipment = await prisma.shipment.update({
      where: { id },
      data: { status }
    });

    // Invalidate cache
    await SearchService.invalidateCache('orders');
    await SearchService.invalidateCache('items');
    
    return shipment;
  }
}