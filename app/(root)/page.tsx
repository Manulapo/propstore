import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";


const HomePage = async () => {
  const latestProducts = await getLatestProducts(4);
  return (
    <>
      <ProductList data={latestProducts} title="Newest Arrival" limit={4}/>
    </>
  );
}

export default HomePage;