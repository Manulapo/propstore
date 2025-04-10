"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ProductType } from "@/types";
import Autoplay from "embla-carousel-autoplay";

const ProductCarousel = ({ data }: { data: ProductType[] }) => {
  return <Carousel className="w-full mb-12" opts={{loop:true}} plugins={[Autoplay({
    delay: 2000,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  })]}></Carousel>;
};

export default ProductCarousel;
