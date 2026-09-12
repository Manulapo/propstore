"use client";

import {
  addItemToCart,
  getCartItemQuantity,
  removeItemFromCart,
} from "@/lib/actions/cart.actions";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/types";
import { Loader, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CART_UPDATED_EVENT } from "../header/cart-events";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    getCartItemQuantity(item.productId)
      .then((currentQuantity) => {
        if (isMounted) setQuantity(currentQuantity);
      })
      .catch(() => {
        if (isMounted) setQuantity(0);
      });

    return () => {
      isMounted = false;
    };
  }, [item.productId]);

  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      setQuantity((currentQuantity) => (currentQuantity ?? 0) + item.qty);
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
      toast({
        description: res.message,
        action: (
          <ToastAction
            className="bg-main rounded-full text-secondary hover:bg-main-hover border-none"
            altText="GoToCart"
            onClick={() => router.push("/cart")}
          >
            Go to cart
          </ToastAction>
        ),
      });
    });
  };

  const handleRemoveFromCart = () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);
      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      setQuantity((currentQuantity) => Math.max((currentQuantity ?? 1) - 1, 0));
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
      toast({
        description: res.message,
      });
    });
  };

  if (quantity === null) {
    return (
      <Button className="w-full" type="button" disabled>
        <Loader className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return quantity > 0 ? (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={handleRemoveFromCart}
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{quantity}</span>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className="w-full"
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}{" "}
      Add to cart
    </Button>
  );
};

export default AddToCart;
