"use client";

import { Review } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import ReviewForm from "./review-form";

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
    console.log('reviewSubmitted')
  };

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
      <div className="flex flex-col gap-3">{/* reviews */}</div>
    </div>
  );
};

export default ReviewList;
