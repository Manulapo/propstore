import { auth } from "@/auth";
import AddToCart from "@/components/shared/product/add-to-cart";
import ProductImage from "@/components/shared/product/product-images";
import ProductPrice from "@/components/shared/product/product-price";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { Cart } from "@/types";
import { notFound } from "next/navigation";
import ReviewList from "./review-list";
import Rating from "@/components/shared/product/ratings";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) notFound(); //if product is not found, return 404
  const session = await auth();
  const userId = session?.user?.id;

  const cart = (await getMyCart()) as Cart;

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* images column */}
          <div className="col-span-2">
            {/* images component */}
            <ProductImage images={product.images} />
          </div>
          {/* details colum */}
          <div className="col-span-2 p-5 ml-4">
            <div className="flex flex-col gap-4">
              <p>{product.brand}</p>
              <h1 className="h3-bold mb-0">{product.name}</h1>
              <p className="text-muted-foreground">{product.category}</p>
              <div className="flex gap-3 items-center">
                <Rating value={Number(product.rating)} />
                <p>{product.numReviews} reviews</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <ProductPrice
                  price={Number(product.price)}
                  className="w-max rounded-full bg-green-100 text-green-700 px-5 py-2"
                />
              </div>
            </div>
            <div className="mt-10">
              <p className="font-semibold">Description</p>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>
          {/* action column */}
          <div>
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex justify-between">
                  <div>Price</div>
                  <div>
                    <ProductPrice price={Number(product.price)} />
                  </div>
                </div>
                <div className="mb-2 flex justify-between">
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <div>
                      <Badge variant={"outline"}>In Stock</Badge>
                    </div>
                  ) : (
                    <div>
                      <Badge variant={"destructive"}>Out of Stock</Badge>
                    </div>
                  )}
                </div>
                {!!product.stock && (
                  <div className="flex-center">
                    <AddToCart
                      cart={cart}
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        qty: 1,
                        image: product.images[0],
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="h2-bold mb-4">Customer Reviews</h2>
        <ReviewList
          userId={userId ?? ""}
          productId={product.id}
          ProductSlug={product.slug}
        />
      </section>
    </>
  );
};

export default ProductDetailsPage;
