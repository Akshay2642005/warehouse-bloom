"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const password_1 = require("../src/utils/password");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Create admin user
    const adminPassword = await (0, password_1.hashPassword)('admin123');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@warehouse.com' },
        update: {},
        create: {
            email: 'admin@warehouse.com',
            password: adminPassword,
            role: 'admin'
        }
    });
    // Create regular user
    const userPassword = await (0, password_1.hashPassword)('user123');
    const user = await prisma.user.upsert({
        where: { email: 'user@warehouse.com' },
        update: {},
        create: {
            email: 'user@warehouse.com',
            password: userPassword,
            role: 'user'
        }
    });
    // Create sample items
    const sampleItems = [
        {
            name: 'Wireless Headphones',
            sku: 'WH-001',
            quantity: 45,
            priceCents: 9999,
            description: 'High-quality wireless headphones with noise cancellation',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            ownerId: admin.id
        },
        {
            name: 'Gaming Keyboard',
            sku: 'GK-002',
            quantity: 8,
            priceCents: 12999,
            description: 'Mechanical gaming keyboard with RGB lighting',
            imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
            ownerId: admin.id
        },
        {
            name: 'Office Chair',
            sku: 'OC-003',
            quantity: 0,
            priceCents: 29999,
            description: 'Ergonomic office chair with lumbar support',
            imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
            ownerId: user.id
        },
        {
            name: 'Desk Lamp',
            sku: 'DL-004',
            quantity: 32,
            priceCents: 4999,
            description: 'LED desk lamp with adjustable brightness',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            ownerId: user.id
        },
        {
            name: 'Water Bottle',
            sku: 'WB-005',
            quantity: 12,
            priceCents: 1999,
            description: 'Stainless steel water bottle with temperature control',
            imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
            ownerId: admin.id
        },
        {
            name: 'Laptop Stand',
            sku: 'LS-006',
            quantity: 25,
            priceCents: 7999,
            description: 'Adjustable aluminum laptop stand',
            imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
            ownerId: user.id
        },
        {
            name: 'Wireless Mouse',
            sku: 'WM-007',
            quantity: 3,
            priceCents: 5999,
            description: 'Ergonomic wireless mouse with precision tracking',
            imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
            ownerId: admin.id
        },
        {
            name: 'Monitor Stand',
            sku: 'MS-008',
            quantity: 18,
            priceCents: 8999,
            description: 'Dual monitor stand with cable management',
            imageUrl: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400',
            ownerId: user.id
        }
    ];
    for (const item of sampleItems) {
        await prisma.item.upsert({
            where: { sku: item.sku },
            update: {},
            create: item
        });
    }
    console.log('✅ Database seeding completed!');
    console.log(`👤 Admin user: admin@warehouse.com / admin123`);
    console.log(`👤 Regular user: user@warehouse.com / user123`);
    console.log(`📦 Created ${sampleItems.length} sample items`);
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
