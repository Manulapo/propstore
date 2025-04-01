/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { convertPrismaObj, formatErrors } from "../utils";
import { LATEST_PRODCUCT_LIMIT, PAGE_SIZE } from "../constants";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validators";
import { z } from "zod";

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

// delete a product by id
export const deleteProduct = async (id: string) => {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return {
      success: false,
      message: formatErrors(error),
    };
  }
};

// create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    // validate the data using zod schema
    const product = insertProductSchema.parse(data);

    await prisma.product.create({ data: product });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    // validate the data using zod schema
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if(!productExists) {
      throw new Error("Product not found");
    }
    
    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}
