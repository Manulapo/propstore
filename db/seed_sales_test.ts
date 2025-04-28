// prisma/seed_sales.ts

import { PrismaClient } from "@prisma/client";
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Fetch existing products and users
  const products = await prisma.product.findMany({ select: { id: true, price: true, name: true, slug: true, images: true } });
  const users = await prisma.user.findMany({ select: { id: true } });

  // Generate 20 random orders
  for (let i = 0; i < 20; i++) {
    const user = faker.helpers.arrayElement(users);
    const itemCount = faker.number.int({ min: 1, max: 5 });

    // Select unique products to avoid duplicates within the same order
    const selectedProducts = faker.helpers.arrayElements(products, itemCount);
    const orderItems = selectedProducts.map((prod) => {
      const qty = faker.number.int({ min: 1, max: 3 });
      return {
        productId: prod.id,
        qty,
        price: prod.price.toNumber(),
        name: prod.name,
        slug: prod.slug,
        image: prod.images[0] || "",
      };
    });

    const itemsPrice = orderItems.reduce((sum, it) => sum + it.price * it.qty, 0);
    const shippingPrice = 15;
    const taxPrice = parseFloat((itemsPrice * 0.1).toFixed(2));
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    const isPaid = faker.datatype.boolean();
    const paidAt = isPaid ? faker.date.recent() : null;
    const isDelivered = isPaid && faker.datatype.boolean();
    const deliveredAt = isDelivered ? faker.date.recent() : null;

    await prisma.order.create({
      data: {
        userId: user.id,
        shippingAddress: {
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        paymentMethod: faker.helpers.arrayElement(["PayPal", "Stripe", "CashOnDelivery"]),
        paymentResult: {
          id: faker.string.uuid(),
          status: isPaid ? "COMPLETED" : "PENDING",
          update_time: new Date().toISOString(),
          email_address: faker.internet.email(),
        },
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isPaid,
        paidAt,
        isDelivered,
        deliveredAt,
        orderitems: { create: orderItems },
      },
    });
  }

  console.log("✅ Seeded 20 sales (orders) with items");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
