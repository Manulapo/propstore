import ProductCard from "@/components/shared/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getAllProducts,
} from "@/lib/actions/product.actions";
import Link from "next/link";

const ratings = [1, 2, 3, 4, 5];
const sortOrders = ["Newest", "Oldest", "Highest", "Lowest", "Rating"];
const prices = [
  { name: "1$ to 50$", value: "1-50" },
  { name: "51$ to 100$", value: "51-100" },
  { name: "101$ to 200$", value: "101-200" },
  { name: "201$ to 500$", value: "201-500" },
  { name: "500$+", value: "500-10000" },
];

const isNotGeneric = (value: string) => {
  return value && value !== "all" && value.trim() !== "";
};

export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    sort?: string;
    page?: string;
    rating?: string;
  }>;
}) {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
  } = await props.searchParams;

  const isQuerySet = isNotGeneric(q);
  const isCategorySet = isNotGeneric(category);
  const isPriceSet = isNotGeneric(price);
  const isRatingSet = isNotGeneric(rating);

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search ${isQuerySet ? q : ""} ${
        isCategorySet ? `Category ${category}` : ""
      } ${isPriceSet ? `Price ${price}$` : ""} ${
        isRatingSet ? `Rating ${rating} & up` : ""
      }`,
      description: `Search results for ${q} in ${category} category with price range ${price} and rating ${rating}`,
    };
  } else {
    return {
      title: "Search Products",
      description: "Search for products",
    };
  }
}

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
    price = "all",
    page = "1",
    sort = "newest",
    rating = "all",
  } = await props.searchParams;

  //   construct filter url
  const getFilterURL = ({
    c,
    p,
    s,
    r,
    pg,
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = {
      q,
      category,
      sort,
      price,
      rating,
      page,
    };

    if (c) params.category = c;
    if (s) params.sort = s;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) params.page = pg;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    sort,
    page: Number(page),
    price,
    rating,
  });

  const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div className="filter-links">
        {/* category links */}
        <div className="text-xl mb-2 mt-8">Category</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${
                  (category === "all" || category === "") && "font-bold"
                }`}
                href={getFilterURL({ c: "all" })}
              >
                Any
              </Link>
            </li>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  className={`${
                    category === x.category && "font-bold"
                  } flex justify-between gap-3`}
                  href={getFilterURL({ c: x.category })}
                >
                  {x.category}
                  <Badge className="" variant={"secondary"}>
                    {x._count.toString()}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* price links */}
        <div className="text-xl mb-2 mt-8">Price</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${price === "all" && "font-bold"}`}
                href={getFilterURL({ p: "all" })}
              >
                Any
              </Link>
            </li>
            {prices.map((x) => (
              <li key={x.value}>
                <Link
                  className={`${price === x.value && "font-bold"}`}
                  href={getFilterURL({ p: x.value })}
                >
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* rating links */}
        <div className="text-xl mb-2 mt-8">Rating</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${rating === "all" && "font-bold"}`}
                href={getFilterURL({ r: "all" })}
              >
                Any
              </Link>
            </li>
            {ratings.map((x) => (
              <li key={x}>
                <Link
                  className={`${rating === x.toString() && "font-bold"}`}
                  href={getFilterURL({ r: x.toString() })}
                >
                  {x} star{Number(x) > 1 ? "s" : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4 md:col-span-4">
        <div className="flex-between flex-col md:flex-row my-4">
          <div className="flex items-center">
            {isNotGeneric(q) && (
              <>
                <span className="font-semibold">Search: </span> {q}
              </>
            )}
            {isNotGeneric(category) && (
              <>
                <span className="font-semibold ml-4">Category: </span>{" "}
                {category}
              </>
            )}
            {isNotGeneric(price) && (
              <>
                <span className="font-semibold ml-4">Price: </span> {price}
              </>
            )}
            {isNotGeneric(rating) && (
              <>
                <span className="font-semibold ml-4">Rating: </span> {rating}
              </>
            )}
            &nbsp;
            {isNotGeneric(q) ||
            isNotGeneric(category) ||
            isNotGeneric(price) ||
            isNotGeneric(rating) ? (
              <Button variant={"link"} asChild>
                <Link href={"/search"}>Clear all</Link>
              </Button>
            ) : null}
          </div>
          <div>
            Sort by:
            {sortOrders.map((x) => (
              <Link
                key={x}
                className={`${sort === x.toLowerCase() && "font-bold"} mx-2`}
                href={getFilterURL({ s: x.toLowerCase() })}
              >
                {x}
              </Link>
            ))}
          </div>
        </div>
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
