import DealCountDown from "@/components/deal-countdown";
import IconBoxes from "@/components/icon-boxes";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProducts from "@/components/view-all-product";
import { getLatestProducts } from "@/lib/actions/product.actions";

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
      <DealCountDown targetDate={"31-12-2025"} orientation="left" />
      <DealCountDown targetDate={"31-06-2025"} orientation="right" />

      <IconBoxes />
    </>
  );
};

export default HomePage;
