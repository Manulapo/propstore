"use client";

import LazyImage from "@/components/shared/lazy-image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const ProductImage = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;

    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % images.length);
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [images.length, current]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        <LazyImage
          src={images[current]}
          alt="product image"
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover object-center"
        />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={`Show product image ${index + 1}`}
            aria-pressed={current === index}
            onClick={() => setCurrent(index)}
            className={cn(
              "relative size-20 shrink-0 overflow-hidden rounded-sm hover:shadow-sm",
              current === index && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <LazyImage
              src={image}
              fill
              sizes="80px"
              alt=""
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>
    </>
  );
};

export default ProductImage;
