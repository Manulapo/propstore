"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewForm from "./review-form";
import { getProductReviews } from "@/lib/actions/review.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { Review } from "@/types";
import { formatDate } from "@/lib/utils";
import Rating from "@/components/shared/product/ratings";

const ReviewList = ({
  userId,
  productId,
  ProductSlug,
}: {
  userId: string;
  productId: string;
  ProductSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const reload = () => {
    console.log("reviewSubmitted");
  };

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getProductReviews({ productId });
      setReviews(
        res.data.map((review) => ({
          ...review,
          user: {
            ...review.user,
            name: review.user.name || "",
          },
        }))
      );
    };

    loadReviews();
  }, [productId]);

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <div>No reviews Yet</div>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please{" "}
          <Link
            href={`/sign-in?callbackUrl=/product/${ProductSlug}`}
            className="text-blue-500"
          >
            sign in
          </Link>{" "}
          to leave a review
        </div>
      )}
      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <CardHeader>
              <div className="flex-between">
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <Rating value={review.rating} />
                <div className="flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  {review.user ? review.user.name : "User"}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDate(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
