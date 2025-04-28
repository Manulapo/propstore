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
      <Heading icon={icon} title={title} />
      <Carousel
        className="w-full mb-12 mt-4"
        opts={{ loop: false }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          {data.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/4 basis-1/2">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  );
};

export default ProductCarousel;
