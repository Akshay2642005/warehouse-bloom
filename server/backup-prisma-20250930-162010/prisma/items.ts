import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create a user
  const user = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: "hashedpassword123", // replace with a properly hashed password in production
      role: "admin",
    },
  });

  console.log(`Created user: ${user.email}`);

  // 2. Create some items for that user
  await prisma.item.createMany({
    data: [
      {
        name: "Laptop",
        sku: "LAPTOP-001",
        quantity: 10,
        priceCents: 150000,
        imageUrl: "https://example.com/laptop.jpg",
        description: "A powerful laptop for developers",
        ownerId: user.id,
      },
      {
        name: "Mouse",
        sku: "MOUSE-001",
        quantity: 50,
        priceCents: 2000,
        imageUrl: "https://example.com/mouse.jpg",
        description: "Wireless ergonomic mouse",
        ownerId: user.id,
      },
      {
        name: "Keyboard",
        sku: "KEYBOARD-001",
        quantity: 30,
        priceCents: 5000,
        imageUrl: "https://example.com/keyboard.jpg",
        description: "Mechanical keyboard with RGB lights",
        ownerId: user.id,
      },
    ],
  });

  console.log("Seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

