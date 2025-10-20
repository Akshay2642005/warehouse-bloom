import { prisma } from '../utils/prisma';
import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(2),
  contactInfo: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export class SupplierService {
  static list(search?: string) {
    return prisma.supplier.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }
  static async create(data: z.infer<typeof supplierSchema>) {
    return prisma.supplier.create({ data });
  }
  static async update(id: string, data: z.infer<typeof supplierSchema>) {
    return prisma.supplier.update({ where: { id }, data });
  }
  static async remove(id: string) {
    // Prevent deletion if supplier has items or orders
    const counts = await prisma.$transaction([
      prisma.item.count({ where: { supplierId: id } }),
      prisma.order.count({ where: { supplierId: id } })
    ]);
    if (counts[0] > 0 || counts[1] > 0) {
      throw new Error('SUPPLIER_IN_USE');
    }
    await prisma.supplier.delete({ where: { id } });
    return true;
  }
}
