import DealCountDown from "@/components/deal-countdown";
import IconBoxes from "@/components/icon-boxes";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProducts from "@/components/view-all-product";
import { getLatestProducts } from "@/lib/actions/product.actions";
import promoObject from '@/public/promo/promo.json';

const HomePage = async () => {
  const latestProducts = await getLatestProducts(4);
  const featuredProducts = await getLatestProducts(4);

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title="Newest Arrival" limit={4} />
      <ViewAllProducts />
      <DealCountDown promoObject={promoObject.monthPromo} orientation="left" />
      <DealCountDown promoObject={promoObject.weeklyPromo} orientation="right" />
      

      <IconBoxes />
    </>
  );
};

export default HomePage;
