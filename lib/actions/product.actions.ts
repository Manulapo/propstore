"use server";

import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import { LATEST_PRODCUCT_LIMIT, PAGE_SIZE } from "../constants";
import { convertToJSObject, formatErrors, shuffleArray } from "../utils";
import { insertProductSchema, updateProductSchema } from "../validators";
import { requireAdminSession } from "../auth-guard";

const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  category: true,
  images: true,
  price: true,
  rating: true,
  stock: true,
} satisfies Prisma.ProductSelect;

const bannerProductSelect = {
  ...productCardSelect,
  banner: true,
} satisfies Prisma.ProductSelect;

const getLatestProductsCached = unstable_cache(
  async (limit: number) => {
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: productCardSelect,
    });

    return convertToJSObject(products);
  },
  ["homepage-latest-products"],
  { revalidate: 60, tags: ["products"] }
);

const getFeaturedProductsCached = unstable_cache(
  async (take: number) => {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      take,
      select: bannerProductSelect,
    });

    return convertToJSObject(products);
  },
  ["homepage-featured-products"],
  { revalidate: 60, tags: ["products"] }
);

const getProductsByCategoryCached = unstable_cache(
  async (category: string, take: number) => {
    const products = await prisma.product.findMany({
      where: { category },
      orderBy: { createdAt: "desc" },
      take,
      select: productCardSelect,
    });

    return convertToJSObject(products);
  },
  ["homepage-products-by-category"],
  { revalidate: 60, tags: ["products"] }
);

const getProductBySlugCached = unstable_cache(
  async (slug: string) =>
    prisma.product.findFirst({
      where: { slug },
    }),
  ["product-by-slug"],
  { revalidate: 60, tags: ["products"] }
);

const getAllCategoriesCached = unstable_cache(
  async () =>
    prisma.product.groupBy({
      by: ["category"],
      _count: true,
    }),
  ["product-categories"],
  { revalidate: 300, tags: ["products"] }
);

export async function getLatestProducts(
  limit: number = LATEST_PRODCUCT_LIMIT,
  shuffle = false
) {
  try {
    const products = await getLatestProductsCached(limit);

    return shuffle
      ? shuffleArray([...products])
      : products;
  } catch (error) {
    console.error("Failed to fetch latest products:", error);
    throw new Error("Failed to fetch latest products");
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await getProductBySlugCached(slug);
    return convertToJSObject(product);
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    throw new Error("Failed to fetch product by slug");
  }
}

export const getProductById = async (productId: string) => {
  try {
    await requireAdminSession();
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
  shuffle = false,
}: {
  query: string;
  page: number;
  limit?: number | null;
  category?: string;
  sort?: string;
  price?: string;
  rating?: string;
  shuffle?: boolean;
}) {
  const safePage = Number.isFinite(Number(page))
    ? Math.max(Math.floor(Number(page)), 1)
    : 1;
  const safeLimit =
    limit == null
      ? null
      : Number.isFinite(Number(limit))
        ? Math.min(Math.max(Math.floor(Number(limit)), 1), 100)
        : PAGE_SIZE;

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
  const priceParts = price && price !== "all" ? price.split("-") : [];
  const minPrice = Number(priceParts[0]);
  const maxPrice = Number(priceParts[1]);
  const priceFilter: Prisma.ProductWhereInput =
    priceParts.length === 2 &&
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    minPrice <= maxPrice
      ? {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        }
      : {};
  // Rating filter
  const ratingValue = Number(rating);
  const ratingFilter: Prisma.ProductWhereInput =
    rating &&
    rating !== "all" &&
    Number.isFinite(ratingValue)
      ? {
          rating: {
            gte: ratingValue,
          },
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

  const where: Prisma.ProductWhereInput = {
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  };

  const data = await prisma.product.findMany({
    where,
    orderBy: sortFilter(),
    skip: safeLimit ? (safePage - 1) * safeLimit : 0,
    take: safeLimit ?? undefined,
    select: productCardSelect,
  });

  const dataCount = await prisma.product.count({ where });

  return {
    data: shuffle
      ? shuffleArray(convertToJSObject(data))
      : convertToJSObject(data),
    totalPage: safeLimit ? Math.ceil(dataCount / safeLimit) : 1,
    currentPage: safePage,
  };
}

// delete a product by id
export const deleteProduct = async (id: string) => {
  try {
    await requireAdminSession();

    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    const historicalItems = await prisma.orderItem.count({
      where: { productId: id },
    });
    if (historicalItems > 0) {
      throw new Error("Products with order history cannot be deleted");
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidateTag("products");
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
    await requireAdminSession();

    // validate the data using zod schema
    const product = insertProductSchema.parse(data);

    await prisma.product.create({ data: product });

    revalidateTag("products");
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
    await requireAdminSession();

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
      data: {
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        stock: product.stock,
        images: product.images,
        isFeatured: product.isFeatured,
        banner: product.banner,
        category: product.category,
        description: product.description,
        price: product.price,
      },
    });

    revalidateTag("products");
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
  return getAllCategoriesCached();
}

// Get featured products
export async function getFeaturedProducts(take = 4) {
  return getFeaturedProductsCached(take);
}

// get puducts by category
export async function getProductsByCategory(category: string, take = 4) {
  return getProductsByCategoryCached(category, take);
}
