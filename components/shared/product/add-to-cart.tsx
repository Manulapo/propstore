'use client'

import { CartItem, Cart } from "@/types";
import { useRouter } from "next/navigation";
import { Minus, Plus, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ item, cart }: { item: CartItem, cart?: Cart }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition(); // useTransition is a react hook that allows you to start a pending transition and show a loader while the transition is pending

    const handleAddToCart = async () => {
        startTransition(async () => {
            const res = await addItemToCart(item);

            if (!res.success) {
                toast({
                    variant: 'destructive',
                    description: res.message,
                });

                return;
            }

            // handle success add to cart
            toast({
                description: `${res.message}`,
                action: (<ToastAction className="bg-primary text-white hover:bg-gray-800" altText="GoToCart" onClick={() => router.push('/cart')}> Go to cart</ToastAction>)
            });
        });
    }

    const handleRemoveFromCart = async () => {
        startTransition(async () => {
            const res = await removeItemFromCart(item.productId);
            toast({
                variant: res.success ? 'default' : 'destructive',
                description: res.message,
            });
            return;
        });
    }

    // check if item is in cart
    const existItem = cart && cart.items.find((cartItem) => cartItem.productId === item.productId);

    return existItem ? (
        <div>
            <Button type="button" variant="outline" onClick={handleRemoveFromCart}>{isPending ? (<Loader className="h-4 w-4 animate-spin" />) : (<Minus className="h-4 w-4" />)}</Button>
            <span className="px-2">{existItem.qty}</span>
            <Button type="button" variant="outline" onClick={handleAddToCart}>{isPending ? (<Loader className="h-4 w-4 animate-spin" />) : (<Plus className="h-4 w-4" />)}</Button>
        </div>) : (
        <Button className="w-full" type="button" onClick={handleAddToCart} >{isPending ? (<Loader className="h-4 w-4 animate-spin" />) : (<Plus className="h-4 w-4" />)} Add to cart</Button>
    );
}

export default AddToCart;