import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export interface CreateTenantData {
  userId: string;
  name: string;
  subdomain: string;
  plan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
}

export class TenantService {
  /**
   * Create a new tenant workspace for a user
   */
  static async createTenant(data: CreateTenantData) {
    try {
      const tenant = await prisma.tenant.create({
        data: {
          userId: data.userId,
          name: data.name,
          subdomain: data.subdomain,
          plan: data.plan || 'FREE',
          isActive: false // Inactive until payment is completed
        }
      });

      // Update user with tenant ID
      await prisma.user.update({
        where: { id: data.userId },
        data: { tenantId: tenant.id }
      });

      logger.info('Tenant created successfully', {
        tenantId: tenant.id,
        userId: data.userId,
        subdomain: data.subdomain
      });

      return tenant;
    } catch (error) {
      logger.error('Failed to create tenant', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: data.userId
      });
      throw error;
    }
  }

  /**
   * Activate tenant after successful payment
   */
  static async activateTenant(tenantId: string) {
    try {
      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { isActive: true }
      });

      // Create default categories for the tenant
      await this.createDefaultCategories(tenantId);

      logger.info('Tenant activated successfully', { tenantId });
      return tenant;
    } catch (error) {
      logger.error('Failed to activate tenant', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId
      });
      throw error;
    }
  }

  /**
   * Create default categories for a new tenant
   */
  private static async createDefaultCategories(tenantId: string) {
    const defaultCategories = [
      'Electronics',
      'Office Supplies',
      'Furniture',
      'Tools',
      'Consumables'
    ];

    await prisma.category.createMany({
      data: defaultCategories.map(name => ({
        name,
        tenantId
      })),
      skipDuplicates: true
    });
  }

  /**
   * Get tenant by user ID
   */
  static async getTenantByUserId(userId: string) {
    return prisma.tenant.findUnique({
      where: { userId },
      include: {
        users: {
          select: { id: true, email: true, name: true, role: true }
        }
      }
    });
  }

  /**
   * Check if user can access tenant data
   */
  static async canUserAccessTenant(userId: string, tenantId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, role: true }
    });

    if (!user) return false;

    // Super admin can access any tenant
    if (user.role === 'SUPER_ADMIN') return true;

    // User can only access their own tenant
    return user.tenantId === tenantId;
  }

  /**
   * Get tenant usage statistics
   */
  static async getTenantUsage(tenantId: string) {
    const [itemCount, orderCount, userCount] = await Promise.all([
      prisma.item.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId } })
    ]);

    return {
      items: itemCount,
      orders: orderCount,
      users: userCount
    };
  }

  /**
   * Check tenant limits based on plan
   */
  static async checkTenantLimits(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true }
    });

    if (!tenant) throw new Error('Tenant not found');

    const usage = await this.getTenantUsage(tenantId);

    const limits = {
      FREE: { items: 100, orders: 50, users: 1 },
      BASIC: { items: 1000, orders: 500, users: 5 },
      PRO: { items: 10000, orders: 5000, users: 25 },
      ENTERPRISE: { items: -1, orders: -1, users: -1 } // Unlimited
    };

    const planLimits = limits[tenant.plan];
    
    return {
      items: {
        current: usage.items,
        limit: planLimits.items,
        exceeded: planLimits.items > 0 && usage.items >= planLimits.items
      },
      orders: {
        current: usage.orders,
        limit: planLimits.orders,
        exceeded: planLimits.orders > 0 && usage.orders >= planLimits.orders
      },
      users: {
        current: usage.users,
        limit: planLimits.users,
        exceeded: planLimits.users > 0 && usage.users >= planLimits.users
      }
    };
  }
}