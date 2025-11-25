// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Create Demo User
  // We create the user record directly. In a real scenario, you'd use the auth library to hash passwords.
  // For dev convenience, we'll assume the user will "Sign Up" with this email to set their password,
  // or we just rely on the existence of the user record for other relations.
  const demoEmail = 'demo@warehouse-bloom.com';
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        name: 'Demo User',
        emailVerified: true,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      },
    });
    console.log('✅ Created demo user');
  } else {
    console.log('ℹ️ Demo user already exists');
  }

  // 2. Create Organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-warehouse' },
    update: {},
    create: {
      name: 'Bloom Logistics',
      slug: 'demo-warehouse',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=BL',
    },
  });
  console.log('✅ Created organization');

  // 3. Add Member
  await prisma.member.upsert({
    where: {
      organizationId_userId: {
        organizationId: demoOrg.id,
        userId: demoUser.id,
      },
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      userId: demoUser.id,
      role: 'OWNER',
    },
  });

  // 4. Subscription
  await prisma.subscription.upsert({
    where: { organizationId: demoOrg.id },
    update: {},
    create: {
      organizationId: demoOrg.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  // 5. Categories
  const categoriesData = [
    { name: 'Electronics', description: 'Gadgets and devices' },
    { name: 'Apparel', description: 'Clothing and accessories' },
    { name: 'Home & Garden', description: 'Furniture and decor' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { organizationId_name: { organizationId: demoOrg.id, name: cat.name } },
      update: {},
      create: { ...cat, organizationId: demoOrg.id },
    });
    categories.push(c);
  }
  console.log('✅ Created categories');

  // 6. Suppliers
  const supplier = await prisma.supplier.create({
    data: {
      organizationId: demoOrg.id,
      name: 'Global Tech Distributors',
      email: 'contact@globaltech.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Blvd, San Francisco, CA',
    },
  });

  // 7. Items
  const itemsData = [
    {
      name: 'Pro Wireless Headset',
      sku: 'AUDIO-001',
      description: 'Noise cancelling wireless headphones',
      quantity: 45,
      minQuantity: 10,
      priceCents: 19999,
      categoryId: categories[0].id,
    },
    {
      name: 'Ergonomic Office Chair',
      sku: 'FURN-001',
      description: 'Mesh back support chair',
      quantity: 12,
      minQuantity: 5,
      priceCents: 24999,
      categoryId: categories[2].id,
    },
    {
      name: 'Cotton T-Shirt (L)',
      sku: 'CLOTH-001',
      description: '100% Cotton Basic Tee',
      quantity: 150,
      minQuantity: 50,
      priceCents: 1999,
      categoryId: categories[1].id,
    },
    {
      name: 'Smart Watch Series 5',
      sku: 'TECH-002',
      description: 'Advanced fitness tracking',
      quantity: 8, // Low stock!
      minQuantity: 15,
      priceCents: 39999,
      categoryId: categories[0].id,
    },
  ];

  const items = [];
  for (const item of itemsData) {
    const i = await prisma.item.upsert({
      where: { organizationId_sku: { organizationId: demoOrg.id, sku: item.sku } },
      update: {},
      create: { ...item, organizationId: demoOrg.id, supplierId: supplier.id },
    });
    items.push(i);
  }
  console.log('✅ Created items');

  // 8. Orders & OrderItems
  const order = await prisma.order.create({
    data: {
      organizationId: demoOrg.id,
      orderNumber: 'ORD-2023-001',
      status: 'PROCESSING',
      totalCents: 21998,
      items: {
        create: [
          { itemId: items[0].id, quantity: 1, priceCents: 19999 },
          { itemId: items[2].id, quantity: 1, priceCents: 1999 },
        ],
      },
    },
  });
  console.log('✅ Created sample order');

  // 9. Shipments
  await prisma.shipment.create({
    data: {
      organizationId: demoOrg.id,
      orderId: order.id,
      carrier: 'FedEx',
      trackingNumber: 'TRK123456789',
      status: 'PENDING',
      destination: '123 Main St, New York, NY',
    },
  });

  // 10. Alerts
  await prisma.alert.create({
    data: {
      organizationId: demoOrg.id,
      type: 'LOW_STOCK',
      severity: 'HIGH',
      message: 'Smart Watch Series 5 is below minimum quantity (8/15)',
      itemId: items[3].id,
    },
  });
  console.log('✅ Created alerts');

  console.log('\n🎉 Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
