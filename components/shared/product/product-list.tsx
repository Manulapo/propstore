import ProductCard from "./product-card";
import { ProductType } from "@/types";

const ProductList = ({ data, title, limit }: { data: ProductType[], title?: string, limit?: number }) => {
    // Limit the number of products to show
    const limitedData = limit ? data.slice(0, limit) : data;

    return (
        <div className="my-10">
            <h2 className="text-2xl font-bold mb-4">
                {title}
            </h2>
            {data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {limitedData.map((product: ProductType) => (
                        <ProductCard product={product} key={product.slug} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">No products found</p>
                </div>
            )}
        </div>
    );
}

export default ProductList;