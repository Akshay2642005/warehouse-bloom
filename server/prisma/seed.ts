import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@warehouse.com' },
    update: {},
    create: {
      email: 'admin@warehouse.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
  // @ts-ignore added after migration
  phoneNumber: '+1-555-0001',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  });

  // Create regular user
  const userPassword = await hashPassword('user123');
  const user = await prisma.user.upsert({
    where: { email: 'user@warehouse.com' },
    update: {},
    create: {
      email: 'user@warehouse.com',
      name: 'John Doe',
      password: userPassword,
      role: 'user',
  // @ts-ignore added after migration
  phoneNumber: '+1-555-0002',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  });

  // Create staff user
  const staffPassword = await hashPassword('staff123');
  const staff = await prisma.user.upsert({
    where: { email: 'staff@warehouse.com' },
    update: {},
    create: {
      email: 'staff@warehouse.com',
      name: 'Jane Smith',
      password: staffPassword,
      role: 'staff',
  // @ts-ignore added after migration
  phoneNumber: '+1-555-0003',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face'
    }
  });

  // Create suppliers
  const suppliers = [
    {
      name: 'TechCorp Supplies',
      email: 'orders@techcorp.com',
      phone: '+1-555-0123',
      address: '123 Tech Street, Silicon Valley, CA 94000',
      contactInfo: 'Primary supplier for electronics and tech accessories'
    },
    {
      name: 'Office Essentials Ltd',
      email: 'sales@officeessentials.com',
      phone: '+1-555-0456',
      address: '456 Business Ave, New York, NY 10001',
      contactInfo: 'Furniture and office equipment supplier'
    },
    {
      name: 'Global Import Co',
      email: 'contact@globalimport.com',
      phone: '+1-555-0789',
      address: '789 Import Blvd, Los Angeles, CA 90001',
      contactInfo: 'International supplier for various consumer goods'
    }
  ];

  const createdSuppliers = [];
  for (const supplier of suppliers) {
    const created = await prisma.supplier.upsert({
      where: { email: supplier.email },
      update: {},
      create: supplier
    });
    createdSuppliers.push(created);
  }

  // Create categories
  const categories = [
    { name: 'Electronics' },
    { name: 'Furniture' },
    { name: 'Accessories' },
    { name: 'Office Supplies' },
    { name: 'Personal Items' }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
    createdCategories.push(created);
  }

  // Create system settings
  const systemSettings = [
    { key: 'low_stock_threshold', value: '10' },
    { key: 'currency', value: 'USD' },
    { key: 'timezone', value: 'America/New_York' },
    { key: 'auto_reorder_enabled', value: 'true' },
    { key: 'email_notifications', value: 'true' }
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }

  // Create sample items with categories and suppliers
  const sampleItems = [
    {
      name: 'Wireless Headphones',
      sku: 'WH-001',
      quantity: 45,
      priceCents: 9999,
      description: 'High-quality wireless headphones with noise cancellation',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      ownerId: admin.id,
      supplierId: createdSuppliers[0].id, // TechCorp
      categoryId: createdCategories[0].id, // Electronics
      reorderLevel: 15
    },
    {
      name: 'Gaming Keyboard',
      sku: 'GK-002',
      quantity: 8,
      priceCents: 12999,
      description: 'Mechanical gaming keyboard with RGB lighting',
      imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
      ownerId: admin.id,
      supplierId: createdSuppliers[0].id, // TechCorp
      categoryId: createdCategories[0].id, // Electronics
      reorderLevel: 10
    },
    {
      name: 'Office Chair',
      sku: 'OC-003',
      quantity: 0,
      priceCents: 29999,
      description: 'Ergonomic office chair with lumbar support',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      ownerId: user.id,
      supplierId: createdSuppliers[1].id, // Office Essentials
      categoryId: createdCategories[1].id, // Furniture
      reorderLevel: 5
    },
    {
      name: 'Desk Lamp',
      sku: 'DL-004',
      quantity: 32,
      priceCents: 4999,
      description: 'LED desk lamp with adjustable brightness',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      ownerId: user.id,
      supplierId: createdSuppliers[1].id, // Office Essentials
      categoryId: createdCategories[3].id, // Office Supplies
      reorderLevel: 20
    },
    {
      name: 'Water Bottle',
      sku: 'WB-005',
      quantity: 12,
      priceCents: 1999,
      description: 'Stainless steel water bottle with temperature control',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      ownerId: admin.id,
      supplierId: createdSuppliers[2].id, // Global Import
      categoryId: createdCategories[4].id, // Personal Items
      reorderLevel: 25
    },
    {
      name: 'Laptop Stand',
      sku: 'LS-006',
      quantity: 25,
      priceCents: 7999,
      description: 'Adjustable aluminum laptop stand',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      ownerId: user.id,
      supplierId: createdSuppliers[0].id, // TechCorp
      categoryId: createdCategories[2].id, // Accessories
      reorderLevel: 15
    },
    {
      name: 'Wireless Mouse',
      sku: 'WM-007',
      quantity: 3,
      priceCents: 5999,
      description: 'Ergonomic wireless mouse with precision tracking',
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      ownerId: admin.id,
      supplierId: createdSuppliers[0].id, // TechCorp
      categoryId: createdCategories[0].id, // Electronics
      reorderLevel: 12
    },
    {
      name: 'Monitor Stand',
      sku: 'MS-008',
      quantity: 18,
      priceCents: 8999,
      description: 'Dual monitor stand with cable management',
      imageUrl: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400',
      ownerId: user.id,
      supplierId: createdSuppliers[1].id, // Office Essentials
      categoryId: createdCategories[2].id, // Accessories
      reorderLevel: 8
    }
  ];

  const createdItems = [];
  for (const item of sampleItems) {
    const created = await prisma.item.upsert({
      where: { sku: item.sku },
      update: {},
      create: item
    });
    createdItems.push(created);
  }

  // Create sample orders with order items for analytics data
  const sampleOrders = [
    {
      orderNumber: 'ORD-001',
      status: 'DELIVERED' as const,
      totalCents: 29997, // 3 headphones
      userId: admin.id,
      supplierId: createdSuppliers[0].id,
      createdAt: new Date('2024-08-15T10:00:00Z'),
      orderItems: [
        { itemId: createdItems.find(i => i.sku === 'WH-001')?.id!, quantity: 3, priceCents: 9999 }
      ]
    },
    {
      orderNumber: 'ORD-002',
      status: 'DELIVERED' as const,
      totalCents: 18998, // 1 keyboard + 1 mouse
      userId: user.id,
      supplierId: createdSuppliers[0].id,
      createdAt: new Date('2024-08-20T14:30:00Z'),
      orderItems: [
        { itemId: createdItems.find(i => i.sku === 'GK-002')?.id!, quantity: 1, priceCents: 12999 },
        { itemId: createdItems.find(i => i.sku === 'WM-007')?.id!, quantity: 1, priceCents: 5999 }
      ]
    },
    {
      orderNumber: 'ORD-003',
      status: 'DELIVERED' as const,
      totalCents: 9998, // 2 desk lamps
      userId: admin.id,
      supplierId: createdSuppliers[1].id,
      createdAt: new Date('2024-09-05T09:15:00Z'),
      orderItems: [
        { itemId: createdItems.find(i => i.sku === 'DL-004')?.id!, quantity: 2, priceCents: 4999 }
      ]
    },
    {
      orderNumber: 'ORD-004',
      status: 'DELIVERED' as const,
      totalCents: 41997, // 1 chair + 1 laptop stand + 2 water bottles
      userId: user.id,
      supplierId: createdSuppliers[1].id,
      createdAt: new Date('2024-09-12T16:45:00Z'),
      orderItems: [
        { itemId: createdItems.find(i => i.sku === 'OC-003')?.id!, quantity: 1, priceCents: 29999 },
        { itemId: createdItems.find(i => i.sku === 'LS-006')?.id!, quantity: 1, priceCents: 7999 },
        { itemId: createdItems.find(i => i.sku === 'WB-005')?.id!, quantity: 2, priceCents: 1999 }
      ]
    },
    {
      orderNumber: 'ORD-005',
      status: 'DELIVERED' as const,
      totalCents: 17998, // 2 monitor stands
      userId: admin.id,
      supplierId: createdSuppliers[1].id,
      createdAt: new Date('2024-09-25T11:20:00Z'),
      orderItems: [
        { itemId: createdItems.find(i => i.sku === 'MS-008')?.id!, quantity: 2, priceCents: 8999 }
      ]
    },
    {
      orderNumber: 'ORD-006',
      status: 'PENDING' as const,
      totalCents: 25998, // 2 keyboards
      userId: user.id,
      supplierId: createdSuppliers[0].id,
      createdAt: new Date('2024-09-28T08:00:00Z'),
      orderItems: [
        { itemId: createdItems.find(i => i.sku === 'GK-002')?.id!, quantity: 2, priceCents: 12999 }
      ]
    },
    {
      orderNumber: 'ORD-007',
      status: 'PROCESSING' as const,
      totalCents: 14998, // 3 water bottles + 1 laptop stand
      userId: staff.id,
      supplierId: createdSuppliers[2].id,
      createdAt: new Date('2024-09-30T15:30:00Z'),
      orderItems: [
        { itemId: createdItems.find(i => i.sku === 'WB-005')?.id!, quantity: 3, priceCents: 1999 },
        { itemId: createdItems.find(i => i.sku === 'LS-006')?.id!, quantity: 1, priceCents: 7999 }
      ]
    }
  ];

  const createdOrders = [];
  let orderCount = 0;
  for (const orderData of sampleOrders) {
    const { orderItems, ...orderInfo } = orderData;
    
    // Use upsert to handle existing orders
    const order = await prisma.order.upsert({
      where: { orderNumber: orderInfo.orderNumber },
      update: {}, // Don't update existing orders
      create: orderInfo
    });
    createdOrders.push(order);

    // Only create order items if they don't exist
    const existingOrderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id }
    });

    if (existingOrderItems.length === 0) {
      for (const orderItem of orderItems) {
        await prisma.orderItem.create({
          data: {
            ...orderItem,
            orderId: order.id
          }
        });
      }
    }
    orderCount++;
  }

  // Create shipments for delivered orders
  const deliveredOrders = createdOrders.filter(order => order.status === 'DELIVERED');
  const carriers = ['FedEx', 'UPS', 'USPS', 'DHL'];
  
  for (let i = 0; i < deliveredOrders.length; i++) {
    const order = deliveredOrders[i];
    
    // Check if shipment already exists
    const existingShipment = await prisma.shipment.findFirst({
      where: { orderId: order.id }
    });
    
    if (!existingShipment) {
      const shippedDate = new Date(order.createdAt);
      shippedDate.setDate(shippedDate.getDate() + 1); // Ship 1 day after order
      
      const deliveredDate = new Date(shippedDate);
      deliveredDate.setDate(deliveredDate.getDate() + 3); // Deliver 3 days after shipping

      const shipment = await prisma.shipment.create({
        data: {
          orderId: order.id,
          carrier: carriers[i % carriers.length],
          trackingNumber: `TRK${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
          destination: `${123 + i} Main St, City ${i + 1}, State ${String.fromCharCode(65 + i)}${String.fromCharCode(65 + i)} 12345`,
          status: 'Delivered',
          shippedDate,
          estimatedDelivery: deliveredDate,
          deliveredDate,
          createdAt: order.createdAt
        }
      });

      // Create shipment events
      const events = [
        { status: 'Order Processed', location: 'Warehouse', note: 'Order has been processed and is ready for shipping', createdAt: order.createdAt },
        { status: 'Shipped', location: 'Origin Facility', note: 'Package has been shipped', createdAt: shippedDate },
        { status: 'In Transit', location: 'Distribution Center', note: 'Package is in transit', createdAt: new Date(shippedDate.getTime() + 24 * 60 * 60 * 1000) },
        { status: 'Out for Delivery', location: 'Local Facility', note: 'Package is out for delivery', createdAt: new Date(deliveredDate.getTime() - 4 * 60 * 60 * 1000) },
        { status: 'Delivered', location: 'Customer Address', note: 'Package delivered successfully', createdAt: deliveredDate }
      ];

      for (const event of events) {
        await prisma.shipmentEvent.create({
          data: {
            shipmentId: shipment.id,
            ...event
          }
        });
      }
    }
  }

  // Create inventory logs for item movements (only if they don't exist)
  const inventoryLogs = [
    { itemId: createdItems.find(i => i.sku === 'WH-001')?.id!, delta: 50, reason: 'Initial stock', createdAt: new Date('2024-08-01T09:00:00Z') },
    { itemId: createdItems.find(i => i.sku === 'WH-001')?.id!, delta: -3, reason: 'Order ORD-001', referenceId: createdOrders.find(o => o.orderNumber === 'ORD-001')?.id, createdAt: new Date('2024-08-15T10:00:00Z') },
    { itemId: createdItems.find(i => i.sku === 'GK-002')?.id!, delta: 20, reason: 'Restock', createdAt: new Date('2024-08-01T09:00:00Z') },
    { itemId: createdItems.find(i => i.sku === 'GK-002')?.id!, delta: -3, reason: 'Orders ORD-002, ORD-006', createdAt: new Date('2024-08-20T14:30:00Z') },
    { itemId: createdItems.find(i => i.sku === 'WM-007')?.id!, delta: 15, reason: 'Initial stock', createdAt: new Date('2024-08-01T09:00:00Z') },
    { itemId: createdItems.find(i => i.sku === 'WM-007')?.id!, delta: -1, reason: 'Order ORD-002', referenceId: createdOrders.find(o => o.orderNumber === 'ORD-002')?.id, createdAt: new Date('2024-08-20T14:30:00Z') },
    { itemId: createdItems.find(i => i.sku === 'DL-004')?.id!, delta: 40, reason: 'Initial stock', createdAt: new Date('2024-08-01T09:00:00Z') },
    { itemId: createdItems.find(i => i.sku === 'DL-004')?.id!, delta: -2, reason: 'Order ORD-003', referenceId: createdOrders.find(o => o.orderNumber === 'ORD-003')?.id, createdAt: new Date('2024-09-05T09:15:00Z') },
    { itemId: createdItems.find(i => i.sku === 'WB-005')?.id!, delta: 30, reason: 'Initial stock', createdAt: new Date('2024-08-01T09:00:00Z') },
    { itemId: createdItems.find(i => i.sku === 'WB-005')?.id!, delta: -5, reason: 'Orders ORD-004, ORD-007', createdAt: new Date('2024-09-12T16:45:00Z') }
  ];

  const existingLogsCount = await prisma.inventoryLog.count();
  if (existingLogsCount === 0) {
    for (const log of inventoryLogs) {
      await prisma.inventoryLog.create({
        data: log
      });
    }
  }

  // Create alerts for low stock items (only if none exist)
  const lowStockAlerts = [
    {
      type: 'LOW_STOCK' as const,
      message: 'Gaming Keyboard (GK-002) is running low on stock. Current quantity: 8',
      itemId: createdItems.find(i => i.sku === 'GK-002')?.id!,
      severity: 'MEDIUM' as const,
      acknowledged: false,
      createdAt: new Date('2024-09-20T08:00:00Z')
    },
    {
      type: 'OUT_OF_STOCK' as const,
      message: 'Office Chair (OC-003) is out of stock. Immediate reorder required.',
      itemId: createdItems.find(i => i.sku === 'OC-003')?.id!,
      severity: 'HIGH' as const,
      acknowledged: false,
      createdAt: new Date('2024-09-15T12:00:00Z')
    },
    {
      type: 'LOW_STOCK' as const,
      message: 'Wireless Mouse (WM-007) is below reorder level. Current quantity: 3',
      itemId: createdItems.find(i => i.sku === 'WM-007')?.id!,
      severity: 'MEDIUM' as const,
      acknowledged: true,
      createdAt: new Date('2024-09-25T14:30:00Z')
    },
    {
      type: 'ORDER_CREATED' as const,
      message: 'New order ORD-006 has been created and is pending processing.',
      severity: 'LOW' as const,
      acknowledged: false,
      createdAt: new Date('2024-09-28T08:00:00Z')
    }
  ];

  const existingAlertsCount = await prisma.alert.count();
  if (existingAlertsCount === 0) {
    for (const alert of lowStockAlerts) {
      await prisma.alert.create({
        data: alert
      });
    }
  }

  // Create notifications for users (only if none exist)
  const notifications = [
    {
      userId: admin.id,
      message: 'Your order ORD-001 has been delivered successfully.',
      type: 'order_update',
      read: true,
      createdAt: new Date('2024-08-18T10:00:00Z')
    },
    {
      userId: user.id,
      message: 'Your order ORD-002 has been shipped. Tracking: TRK123456',
      type: 'shipping_update',
      read: true,
      createdAt: new Date('2024-08-21T14:30:00Z')
    },
    {
      userId: admin.id,
      message: 'Low stock alert: Gaming Keyboard (GK-002) needs restocking.',
      type: 'inventory_alert',
      read: false,
      createdAt: new Date('2024-09-20T08:00:00Z')
    },
    {
      userId: user.id,
      message: 'Your order ORD-006 is currently being processed.',
      type: 'order_update',
      read: false,
      createdAt: new Date('2024-09-28T08:15:00Z')
    },
    {
      userId: staff.id,
      message: 'Welcome to the warehouse management system!',
      type: 'system',
      read: false,
      createdAt: new Date('2024-09-30T09:00:00Z')
    }
  ];

  const existingNotificationsCount = await prisma.notification.count();
  if (existingNotificationsCount === 0) {
    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification
      });
    }
  }

  // Create sample invitation tokens (only if none exist)
  const invitations = [
    {
      email: 'newstaff@warehouse.com',
      role: 'staff',
      token: 'INV-' + Math.random().toString(36).substring(2, 15),
      accepted: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      invitedById: admin.id,
      createdAt: new Date('2024-09-25T10:00:00Z')
    },
    {
      email: 'manager@warehouse.com',
      role: 'admin',
      token: 'INV-' + Math.random().toString(36).substring(2, 15),
      accepted: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      invitedById: admin.id,
      createdAt: new Date('2024-09-28T15:30:00Z')
    }
  ];

  const existingInvitationsCount = await prisma.invitationToken.count();
  if (existingInvitationsCount === 0) {
    for (const invitation of invitations) {
      await prisma.invitationToken.create({
        data: invitation
      });
    }
  }

  console.log('✅ Database seeding completed!');
  console.log(`👤 Admin user: admin@warehouse.com / admin123`);
  console.log(`👤 Regular user: user@warehouse.com / user123`);
  console.log(`👤 Staff user: staff@warehouse.com / staff123`);
  console.log(`🏢 Created ${createdSuppliers.length} suppliers`);
  console.log(`� Created ${createdCategories.length} categories`);
  console.log(`📦 Created ${createdItems.length} sample items`);
  console.log(`🛒 Created ${orderCount} sample orders with order items`);
  console.log(`🚚 Created ${deliveredOrders.length} shipments with tracking events`);
  console.log(`📊 Created ${inventoryLogs.length} inventory movement logs`);
  console.log(`⚠️  Created ${lowStockAlerts.length} alerts`);
  console.log(`🔔 Created ${notifications.length} notifications`);
  console.log(`📧 Created ${invitations.length} staff invitations`);
  console.log(`⚙️  Created ${systemSettings.length} system settings`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });