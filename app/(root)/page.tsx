import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";


const HomePage = async () => {
  const latestProducts = await getLatestProducts(4);
  const formattedProducts = latestProducts.map(product => ({
    ...product,
    price: product.price.toString(),
    rating: product.rating.toString()
  }));
  return (
    <>
      <ProductList data={formattedProducts} title="Newest Arrival" limit={4}/>
    </>
  );
}

export default HomePage;