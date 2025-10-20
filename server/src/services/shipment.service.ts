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

    if (process.env.NODE_ENV !== 'test') {
      await SearchService.invalidateCache('orders');
    }
    
    return shipment;
  }

  static async updateShipmentStatus(id: string, status: string) {
    const shipment = await prisma.shipment.update({
      where: { id },
      data: { status }
    });

    if (process.env.NODE_ENV !== 'test') {
      await SearchService.invalidateCache('orders');
      await SearchService.invalidateCache('items');
    }
    
    return shipment;
  }

  static async updateShipment(id: string, data: {
    carrier?: string;
    trackingNumber?: string;
    destination?: string;
    estimatedDelivery?: string;
    status?: string;
  }) {
    const updateData: any = { ...data };
    if (data.estimatedDelivery) {
      updateData.estimatedDelivery = new Date(data.estimatedDelivery);
    }
    const shipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
      include: { order: { select: { id: true, orderNumber: true } } }
    });
    if (process.env.NODE_ENV !== 'test') {
      await SearchService.invalidateCache('orders');
    }
    return shipment;
  }

  static async deleteShipment(id: string) {
    await prisma.shipment.delete({ where: { id } });
    if (process.env.NODE_ENV !== 'test') {
      await SearchService.invalidateCache('orders');
    }
    return true;
  }

  static async getStats() {
    const [total, processing, inTransit, delivered, delayed] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: 'Processing' } }),
      prisma.shipment.count({ where: { status: 'In Transit' } }),
      prisma.shipment.count({ where: { status: 'Delivered' } }),
      prisma.shipment.count({ where: { status: 'Delayed' } })
    ]);
    return { total, processing, inTransit, delivered, delayed };
  }
}