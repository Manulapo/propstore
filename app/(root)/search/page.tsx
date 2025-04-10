import ProductCard from "@/components/shared/product/product-card";
import { getAllProducts } from "@/lib/actions/product.actions";

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    sort?: string;
    page?: string;
    rating?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    sort = "newest",
    page = "1",
    price,
    rating,
  } = await props.searchParams;
  const products = await getAllProducts({
    query: q,
    category,
    sort,
    page: Number(page),
    price,
    rating,
  });

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div className="filter-links">{/* filters */}</div>
      <div className="space-y-4 md:col-span-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 ? (
            <div className="col-span-3 text-center">
              <h2 className="text-2xl font-bold">No products found</h2>
              <p className="text-gray-500">Try a different search</p>
            </div>
          ) : (
            products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
