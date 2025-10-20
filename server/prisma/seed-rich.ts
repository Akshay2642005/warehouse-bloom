import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const COMPANIES = [
  { name: 'TechHub Electronics', domain: 'techhub', industry: 'Electronics' },
  { name: 'FreshMart Groceries', domain: 'freshmart', industry: 'Retail' },
  { name: 'BuildPro Hardware', domain: 'buildpro', industry: 'Construction' },
  { name: 'StyleWear Fashion', domain: 'stylewear', industry: 'Fashion' },
  { name: 'HomeComfort Furniture', domain: 'homecomfort', industry: 'Furniture' },
  { name: 'AutoParts Direct', domain: 'autoparts', industry: 'Automotive' },
  { name: 'BookNest Publishing', domain: 'booknest', industry: 'Publishing' },
  { name: 'MediSupply Healthcare', domain: 'medisupply', industry: 'Healthcare' },
  { name: 'SportGear Athletics', domain: 'sportgear', industry: 'Sports' },
  { name: 'GreenLeaf Organic', domain: 'greenleaf', industry: 'Organic' }
];

const CATEGORIES_BY_INDUSTRY = {
  Electronics: ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Cameras', 'Gaming', 'Smart Home', 'Wearables', 'Components'],
  Retail: ['Fresh Produce', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Frozen Foods', 'Household', 'Personal Care', 'Pet Supplies', 'Baby Products'],
  Construction: ['Power Tools', 'Hand Tools', 'Lumber', 'Plumbing', 'Electrical', 'Paint', 'Hardware', 'Safety Equipment', 'Concrete', 'Roofing'],
  Fashion: ['Mens Wear', 'Womens Wear', 'Kids Wear', 'Footwear', 'Accessories', 'Bags', 'Jewelry', 'Watches', 'Sunglasses', 'Activewear'],
  Furniture: ['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor', 'Storage', 'Lighting', 'Decor', 'Mattresses', 'Kids Furniture'],
  Automotive: ['Engine Parts', 'Brakes', 'Suspension', 'Electrical', 'Filters', 'Oils', 'Tires', 'Body Parts', 'Interior', 'Tools'],
  Publishing: ['Fiction', 'Non-Fiction', 'Textbooks', 'Childrens Books', 'Comics', 'Magazines', 'Journals', 'E-Books', 'Audiobooks', 'Stationery'],
  Healthcare: ['Medications', 'Medical Devices', 'Surgical Supplies', 'Diagnostics', 'PPE', 'First Aid', 'Mobility Aids', 'Wound Care', 'Lab Equipment', 'Sanitizers'],
  Sports: ['Fitness Equipment', 'Team Sports', 'Outdoor Gear', 'Cycling', 'Water Sports', 'Winter Sports', 'Apparel', 'Footwear', 'Nutrition', 'Recovery'],
  Organic: ['Organic Vegetables', 'Organic Fruits', 'Grains', 'Nuts', 'Seeds', 'Herbs', 'Spices', 'Oils', 'Supplements', 'Beverages']
};

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('🌱 Starting rich multi-tenant seeding...');

  const password = await hashPassword('password123');
  
  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: 'Global Imports Inc', email: 'sales@globalimports.com', phone: '+1-555-0101' } }),
    prisma.supplier.create({ data: { name: 'Wholesale Direct', email: 'orders@wholesaledirect.com', phone: '+1-555-0102' } }),
    prisma.supplier.create({ data: { name: 'Premium Suppliers Co', email: 'info@premiumsuppliers.com', phone: '+1-555-0103' } }),
    prisma.supplier.create({ data: { name: 'FastShip Logistics', email: 'support@fastship.com', phone: '+1-555-0104' } }),
    prisma.supplier.create({ data: { name: 'Quality Goods Ltd', email: 'contact@qualitygoods.com', phone: '+1-555-0105' } })
  ]);

  for (let i = 0; i < COMPANIES.length; i++) {
    const company = COMPANIES[i];
    console.log(`\n📦 Creating tenant ${i + 1}/10: ${company.name}...`);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: `admin@${company.domain}.com`,
        name: `${company.name} Admin`,
        password,
        role: company.domain === 'techhub' ? 'ADMIN' : 'USER',
        isActive: true,
      }
    });

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        name: company.name,
        subdomain: company.domain,
        plan: randomChoice(['BASIC', 'PRO', 'ENTERPRISE']),
        isActive: true
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { tenantId: tenant.id }
    });

    // Create categories
    const categoryNames = CATEGORIES_BY_INDUSTRY[company.industry as keyof typeof CATEGORIES_BY_INDUSTRY];
    const categories = await Promise.all(
      categoryNames.map(name => 
        prisma.category.create({ data: { name, tenantId: tenant.id } })
      )
    );

    // Create 50-100 items
    const itemCount = random(50, 100);
    const items = [];
    for (let j = 0; j < itemCount; j++) {
      const category = randomChoice(categories);
      const supplier = randomChoice(suppliers);
      const basePrice = random(500, 50000);
      
      const item = await prisma.item.create({
        data: {
          name: `${category.name} Item ${j + 1}`,
          sku: `${company.domain.toUpperCase()}-${String(j + 1).padStart(4, '0')}`,
          quantity: random(0, 500),
          priceCents: basePrice,
          costCents: Math.floor(basePrice * 0.6),
          description: `High quality ${category.name.toLowerCase()} product`,
          ownerId: user.id,
          tenantId: tenant.id,
          categoryId: category.id,
          supplierId: supplier.id,
          reorderLevel: random(10, 50),
          minStock: random(5, 20),
          maxStock: random(200, 1000),
          barcode: `${random(100000000, 999999999)}`,
          location: `Aisle ${random(1, 20)}-${random(1, 10)}`
        }
      });
      items.push(item);
    }

    // Create orders (10-30 per tenant)
    const orderCount = random(10, 30);
    for (let k = 0; k < orderCount; k++) {
      const orderDate = new Date(Date.now() - random(0, 90) * 24 * 60 * 60 * 1000);
      const status = randomChoice(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
      
      const orderItems = [];
      const itemsInOrder = random(1, 5);
      let totalCents = 0;
      
      for (let l = 0; l < itemsInOrder; l++) {
        const item = randomChoice(items);
        const quantity = random(1, 10);
        const price = item.priceCents;
        totalCents += price * quantity;
        orderItems.push({ itemId: item.id, quantity, priceCents: price });
      }

      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${company.domain.toUpperCase()}-${String(k + 1).padStart(4, '0')}`,
          userId: user.id,
          tenantId: tenant.id,
          status,
          totalCents,
          taxCents: Math.floor(totalCents * 0.08),
          shippingCents: random(500, 2000),
          supplierId: randomChoice(suppliers).id,
          createdAt: orderDate
        }
      });

      // Create order items
      for (const oi of orderItems) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            itemId: oi.itemId,
            quantity: oi.quantity,
            priceCents: oi.priceCents
          }
        });
      }

      // Create payment for order
      const paymentStatus = status === 'DELIVERED' ? 'COMPLETED' : 
                           status === 'CANCELLED' ? 'FAILED' : 'PENDING';
      
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: totalCents + Math.floor(totalCents * 0.08) + random(500, 2000),
          currency: 'USD',
          status: paymentStatus,
          provider: 'polar',
          providerPaymentId: `pay_${random(100000, 999999)}`,
          createdAt: orderDate
        }
      });

      // Create shipment for shipped/delivered orders
      if (status === 'SHIPPED' || status === 'DELIVERED') {
        const shipDate = new Date(orderDate.getTime() + random(1, 3) * 24 * 60 * 60 * 1000);
        await prisma.shipment.create({
          data: {
            orderId: order.id,
            carrier: randomChoice(['FedEx', 'UPS', 'USPS', 'DHL']),
            trackingNumber: `TRK${random(100000000, 999999999)}`,
            destination: `${random(100, 9999)} Main St, City, State`,
            status: status === 'DELIVERED' ? 'Delivered' : 'In Transit',
            shippedDate: shipDate,
            estimatedDelivery: new Date(shipDate.getTime() + random(3, 7) * 24 * 60 * 60 * 1000),
            deliveredDate: status === 'DELIVERED' ? new Date(shipDate.getTime() + random(3, 5) * 24 * 60 * 60 * 1000) : null
          }
        });
      }
    }

    // Create alerts (5-15 per tenant)
    const lowStockItems = items.filter(i => i.quantity < i.reorderLevel).slice(0, random(5, 15));
    for (const item of lowStockItems) {
      await prisma.alert.create({
        data: {
          type: item.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          message: item.quantity === 0 
            ? `${item.name} is out of stock` 
            : `${item.name} is below reorder level (${item.quantity}/${item.reorderLevel})`,
          itemId: item.id,
          severity: item.quantity === 0 ? 'HIGH' : 'MEDIUM',
          acknowledged: random(0, 1) === 1
        }
      });
    }

    // Create inventory logs
    for (let m = 0; m < random(20, 50); m++) {
      const item = randomChoice(items);
      const delta = random(-50, 100);
      await prisma.inventoryLog.create({
        data: {
          itemId: item.id,
          delta,
          reason: delta > 0 ? randomChoice(['Restock', 'Return', 'Adjustment']) : randomChoice(['Sale', 'Damage', 'Theft']),
          createdAt: new Date(Date.now() - random(0, 60) * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Create notifications
    for (let n = 0; n < random(5, 15); n++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          message: randomChoice([
            'New order received',
            'Low stock alert',
            'Shipment delivered',
            'Payment processed',
            'Inventory updated'
          ]),
          type: randomChoice(['order_update', 'inventory_alert', 'shipping_update', 'payment_update']),
          read: random(0, 1) === 1,
          createdAt: new Date(Date.now() - random(0, 30) * 24 * 60 * 60 * 1000)
        }
      });
    }

    console.log(`✅ ${company.name}: ${items.length} items, ${orderCount} orders, ${lowStockItems.length} alerts`);
  }

  console.log('\n🎉 Rich seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`👥 Users: ${COMPANIES.length}`);
  console.log(`🏢 Tenants: ${COMPANIES.length}`);
  console.log(`📦 Total Items: ${await prisma.item.count()}`);
  console.log(`🛒 Total Orders: ${await prisma.order.count()}`);
  console.log(`⚠️  Total Alerts: ${await prisma.alert.count()}`);
  console.log(`💳 Total Payments: ${await prisma.payment.count()}`);
  console.log('\n🔑 Login credentials (all use password: password123):');
  COMPANIES.forEach(c => console.log(`   - admin@${c.domain}.com`));
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
