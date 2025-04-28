// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { products } from "./product_sample_data";

const prisma = new PrismaClient();

async function main() {
  // 1. Seed products
  //    Use `createMany` for speed if you don't need nested creates.
  await prisma.product.createMany({
    data: products.map(
      ({
        name,
        slug,
        category,
        description,
        images,
        price,
        brand,
        rating,
        numReviews,
        stock,
        isFeatured,
        banner,
      }) => ({
        name,
        slug,
        category,
        description,
        images,
        price,
        brand,
        rating,
        numReviews,
        stock,
        isFeatured,
        banner,
      })
    ),
    skipDuplicates: false,
  });
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
