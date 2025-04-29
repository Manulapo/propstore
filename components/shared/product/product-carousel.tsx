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
import React from "react";
import Heading from "../header/heading";
import ProductCard from "./product-card";

const ProductCarousel = ({
  data,
  title,
  icon,
}: {
  data: ProductType[];
  title?: string;
  icon?: React.ReactElement;
}) => {
  return (
    <>
      <Carousel
        className="my-12 px-4"
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <div className="flex items-center justify-between">
          <Heading icon={icon} title={title} />
          <CarouselPrevious />
          <CarouselNext />
        </div>
        <CarouselContent>
          {data.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/4 basis-1/2">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  );
};

export default ProductCarousel;
