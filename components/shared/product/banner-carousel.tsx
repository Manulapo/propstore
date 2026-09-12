"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCardType } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import LazyImage from "@/components/shared/lazy-image";
import Link from "next/link";

const BannerCarousel = ({
  data,
}: {
  data: (ProductCardType & { banner: string | null })[];
}) => {
  return (
    <Carousel
      className="w-full mb-12"
      opts={{ loop: true }}
      plugins={[
        Autoplay({
          delay: 10000,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {data.map(
          (product) =>
            product?.banner && (
              <CarouselItem key={product.id}>
                <Link href={`/product/${product.slug}`}>
                  <div className="relative mx-auto">
                    <LazyImage
                      src={product?.banner}
                      alt={product.name}
                      width={0}
                      height={0}
                      className="w-full h-auto rounded-md"
                      sizes="100vw"
                    />
                  </div>
                </Link>
              </CarouselItem>
            )
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default BannerCarousel;
