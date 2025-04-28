// prisma/seed.ts
import { PrismaClient, Review } from "@prisma/client";
import { reviews } from "./product_review_sample_data";
import { uuids } from "./sample-data";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  for (const r of reviews) {
    // look up the product’s ID by slug
    const prod = await prisma.product.findUnique({
      where: { slug: r.productSlug },
      select: { id: true },
    });
    if (!prod) continue;

    await prisma.review.create({
      data: {
        productId: prod.id,
        userId: uuids[Math.floor(Math.random() * uuids.length)],
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
