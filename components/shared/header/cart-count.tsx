"use client";

import { getCartItemCount } from "@/lib/actions/cart.actions";
import { useCallback, useEffect, useState } from "react";
import { CART_UPDATED_EVENT } from "./cart-events";

const CartCount = () => {
  const [count, setCount] = useState<number | null>(null);

  const loadCount = useCallback(async () => {
    try {
      setCount(await getCartItemCount());
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void loadCount();
    window.addEventListener(CART_UPDATED_EVENT, loadCount);

    return () => window.removeEventListener(CART_UPDATED_EVENT, loadCount);
  }, [loadCount]);

  if (!count) return null;

  return (
    <span className="ml-1 rounded-full bg-main w-5 h-5 text-secondary justify-center flex text-xs items-center absolute top-0 right-0 border-none">
      {count}
    </span>
  );
};

export default CartCount;
