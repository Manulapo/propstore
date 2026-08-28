// prisma/seed.ts
import { PrismaClient, Review } from "@prisma/client";
import { reviews } from "./product_review_sample_data";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) throw new Error("Seed users before reviews");

  for (const r of reviews) {
    // look up the product’s ID by slug
    const prod = await prisma.product.findUnique({
      where: { slug: r.productSlug },
      select: { id: true },
    });
    if (!prod) continue;

    const user = users[Math.floor(Math.random() * users.length)];
    await prisma.review.upsert({
      where: {
        userId_productId: { userId: user.id, productId: prod.id },
      },
      update: {
        rating: r.rating,
        title: r.title,
        description: r.description,
        isVerifiedPurchase: Math.random() < 0.5,
      },
      create: {
        productId: prod.id,
        userId: user.id,
        rating: r.rating,
        title: r.title,
        description: r.description,
        isVerifiedPurchase: Math.random() < 0.5, // 50% chance
        createdAt: faker.date.past({ years: 1 }),
      } as Review,
    });
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
