import DealCountDown from "@/components/deal-countdown";
import IconBoxes from "@/components/icon-boxes";
import Hero from "@/components/shared/header/hero";
import BannerCarousel from "@/components/shared/product/banner-carousel";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProducts from "@/components/view-all-product";
import {
  getFeaturedProducts,
  getLatestProducts,
  getProductsByCategory,
} from "@/lib/actions/product.actions";
import promoObject from "@/public/promo/promo.json";
import { FilmIcon, StarsIcon } from "lucide-react";

const HomePage = async () => {
  const latestProducts = await getLatestProducts(8, true);
  const featuredProducts = await getFeaturedProducts(4);
  const harryPotterProducts = await getProductsByCategory("Harry Potter");

  return (
    <>
      <Hero />
      {featuredProducts.length > 0 && (
        <BannerCarousel data={featuredProducts} />
      )}
      <ProductCarousel data={latestProducts} title="New arrival" icon={<FilmIcon />} />
      <ViewAllProducts />
      <DealCountDown
        promoObject={promoObject.monthPromo}
        orientation="right"
      />
      <ProductList
        data={harryPotterProducts}
        title="Harry Potter Fever"
        limit={4}
        icon={<StarsIcon />}
      />

      <IconBoxes />
    </>
  );
};

export default HomePage;
