"use server";

import { convertPrismaObj } from "../utils";
import { LATEST_PRODCUCT_LIMIT, PAGE_SIZE } from "../constants";
import { prisma } from "@/db/prisma";

export async function getLatestProducts(limit: number = LATEST_PRODCUCT_LIMIT) {
  try {
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return convertPrismaObj(products);
  } catch (error) {
    console.error("Failed to fetch latest products:", error);
    throw new Error("Failed to fetch latest products");
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug },
    });

    return convertPrismaObj(product);
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    throw new Error("Failed to fetch product by slug");
  }
}

// return all the products with pagination
export async function getAllProducts({
  query,
  page,
  limit = PAGE_SIZE,
  category,
}: {
  query: string;
  page: number;
  limit?: number;
  category?: string;
}) {
  const data = await prisma.product.findMany({
    skip: (Number(page) - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();

  return {
    data: convertPrismaObj(data),
    totalPage: Math.ceil(dataCount / limit),
    currentPage: page,
  };
}
