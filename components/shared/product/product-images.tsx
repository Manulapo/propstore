'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";


const ProductImage = ({ images }: { images: string[] }) => {
    const [current, setCurrent] = useState(0);
    return (
        <>
            <div className="space-y-4">
                <Image
                    src={images[current]}
                    width={1000}
                    height={1000}
                    alt="product image"
                    className="min-h-[300] object-cover object-center" />
            </div>
            <div className="flex mt-3" >
                {images.map((image, index) => (
                    <div key={index} onClick={() => setCurrent(index)}>
                        <Image
                            src={image}
                            width={100}
                            height={100}
                            alt="product image"
                            className={ cn('rounded-sm mr-2 cursor-pointer hover:shadow-sm', current === index && 'border')}
                            onClick={() => setCurrent(index)} />
                    </div>
                ))}
            </div>
        </>
    );
}

export default ProductImage;