/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { convertToJSObject, formatErrors } from "../utils";
import { LATEST_PRODCUCT_LIMIT, PAGE_SIZE } from "../constants";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validators";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export async function getLatestProducts(limit: number = LATEST_PRODCUCT_LIMIT) {
  try {
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return convertToJSObject(products);
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

    return convertToJSObject(product);
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    throw new Error("Failed to fetch product by slug");
  }
}

export const getProductById = async (productId: string) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    return convertToJSObject(product);
  } catch (error) {
    console.error("Failed to fetch product by ID:", error);
    throw new Error("Failed to fetch product by ID");
  }
};

// return all the products with pagination
export async function getAllProducts({
  query,
  page,
  limit = PAGE_SIZE,
  category,
  sort,
  price,
  rating,
}: {
  query: string;
  page: number;
  limit?: number;
  category?: string;
  sort?: string;
  price?: string;
  rating?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  // Category filter
  const categoryFilter = category && category !== "all" ? { category } : {};
  // Sort filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]), //greater than or equal to the first value
            lte: Number(price.split("-")[1]), //less than or equal to the second value
          } as Prisma.IntFilter,
        }
      : {};
  // Rating filter
  const ratingFilter: Prisma.ProductWhereInput =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating), //greater than or equal to the value
          } as Prisma.IntFilter,
        }
      : {};

  const sortFilter = () => {
    switch (sort) {
      case "lowest":
        return { price: "asc" as Prisma.SortOrder };
      case "highest":
        return { price: "desc" as Prisma.SortOrder };
      case "rating":
        return { rating: "desc" as Prisma.SortOrder };
      case "oldest":
        return { createdAt: "asc" as Prisma.SortOrder };
      default:
        return { createdAt: "desc" as Prisma.SortOrder };
    }
  };

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy: sortFilter(),
    skip: (Number(page) - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();

  return {
    data: convertToJSObject(data),
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

    if (!productExists) {
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

// get all categories
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}

// Get featured products
export async function getFeaturedProducts(take = 4) {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take,
  });

  return convertToJSObject(data);
}
