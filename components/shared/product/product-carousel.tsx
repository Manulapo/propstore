"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductType } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";

const ProductCarousel = ({ data }: { data: ProductType[] }) => {
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
                    <Image
                      src={product?.banner}
                      alt={product.name}
                      width={0}
                      height={0}
                      className="w-full h-auto rounded-md"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 flex items-end justify-end">
                      <h2 className="bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white">
                        {product.name}
                      </h2>
                    </div>
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

export default ProductCarousel;
