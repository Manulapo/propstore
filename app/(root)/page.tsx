import DealCountDown from "@/components/deal-countdown";
import IconBoxes from "@/components/icon-boxes";
import Hero from "@/components/shared/header/hero";
import BannerCarousel from "@/components/shared/product/banner-carousel";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import StaticBanner from "@/components/ui/static-banner";
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
      <BannerCarousel
        data={promoObject.banners}
        isStatic={true}
        className="hidden md:block"
      />
      <ProductCarousel
        data={latestProducts}
        title="New arrival"
        icon={<FilmIcon />}
      />
      <ViewAllProducts />
      <DealCountDown
        promoObject={promoObject.starWarsPromo}
        orientation="right"
      />
      <ProductList
        data={harryPotterProducts}
        title="Harry Potter Fever"
        limit={4}
        icon={<StarsIcon />}
      />
      <div className="my-4">
        <IconBoxes />
      </div>
    </>
  );
};

export default HomePage;
