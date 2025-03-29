import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProductPrice from "./product-price";
import { ProductType } from "@/types/index";

const ProductCard = ({ product }: { product: ProductType }) => {
    return (
        <Card className="overflow-hidden mx-3">
            <CardHeader className='p-0 items-center'>
                <Link href={`/product/${product.slug}`}>
                    <Image
                        priority={true}
                        src={product.images![0]}
                        alt={product.name}
                        className='aspect-square object-cover rounded'
                        height={300}
                        width={300}
                    />
                </Link>
            </CardHeader>
            <CardContent className="p-4 grid gap-4">
                <span className="text-sm text-muted-foreground">{product.brand}</span>
                <Link
                    href={`/product/${product.slug}`}
                    className="text-sm underline-offset-4 hover:underline"
                >
                    <h3 className="font-semibold truncate ">{product.name}</h3>
                </Link>
                <div className="flex justify-between items-center mt-4">
                    <p>{Number(product.rating)} stars</p>
                    {product.stock > 0 ? (
                        <ProductPrice price={Number(product.price)} />
                    ) : (
                        <p className='text-destructive'>Out of Stock</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default ProductCard;