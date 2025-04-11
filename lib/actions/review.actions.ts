"use server";

import { z } from "zod";
import { insertReviewSchema } from "../validators";
import { formatErrors } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

// Create & Update review
export async function creatUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error("User not authenticated");

    // validate and store the review in a variable
    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error("Product not found");

    // check if the user has already reviewed the product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: review.userId,
        productId: review.productId,
      },
    });

    // transction to create or update the review
    await prisma.$transaction(async (tx) => {
      if (existingReview) {
        // update the review if it exists
        await tx.review.update({
          where: { id: existingReview.id },
          data: {
            title: review.title,
            rating: review.rating,
            description: review.description,
          },
        });
      } else {
        await tx.review.create({
          data: review,
        });
      }

      //   get avg rating
      const avgRating = await tx.review.aggregate({
        where: { productId: review.productId },
        _avg: { rating: true },
      });

      //   get all reviews count
      const reviewsCount = await tx.review.count({
        where: { productId: review.productId },
      });

      //   update rating and numReviews in product table
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: Number(avgRating._avg.rating ?? 0),
          numReviews: reviewsCount,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: "Review submitted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// get all reviews for a product
export async function getProductReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return { data };
}

// get review by user
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();
  if (!session) throw new Error("User not authenticated");
  const userId = session.user.id;

  return await prisma.review.findFirst({
    where: {
      userId,
      productId,
    },
  });
}
