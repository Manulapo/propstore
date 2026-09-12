"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  freeShippingMinValue,
  shippingPriceValue,
  taxRate,
} from "../constants";
import {
  convertToJSObject as convertToPlainObject,
  formatErrors,
  roundNumber,
} from "../utils";
import {
  CartItemInputSchema,
  CartItemSchema,
  InsertCartSchema,
} from "../validators";

type CartLookup = {
  where: Prisma.CartWhereInput;
};

const getCartLookup = async (): Promise<CartLookup | undefined> => {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) return undefined;

  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : undefined;

  return {
    where: userId ? { userId } : { sessionCartId },
  };
};

// calculate cart prices
export const calcPrice = async (items: CartItem[]) => {
  // calculate prices of every item in the cart
  const itemsPrice = items.reduce(
    (acc, item) => acc + Number(item.price) * item.qty,
    0
  );

  // calculate shipping price
  const shippingPrice =
    roundNumber(itemsPrice) > freeShippingMinValue ? 0 : shippingPriceValue;

  // calculate tax, shipping and total price
  const taxPrice = roundNumber(itemsPrice * taxRate);
  const totalPrice = roundNumber(itemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

// Add item to cart should both add the item to the cart and return a response with a success message or an error message and the cart items
export async function addItemToCart(
  data: CartItem
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Retrieve and validate the cart session ID from cookies.
    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("Cart session not found");
    }

    // 2. Retrieve the current user session and extract the user ID if available.
    const session = await auth();
    const userId = session?.user?.id ? String(session.user.id) : undefined;

    // 3. Get the user's existing cart (if any).
    const cart = await getMyCart();

    // Only accept the product ID and quantity from the client. Rebuild all
    // other fields from the database so prices and display data cannot be
    // tampered with.
    const itemInput = CartItemInputSchema.parse({
      productId: data.productId,
      qty: data.qty,
    });

    // 5. Retrieve the product from the database.
    const product = await prisma.product.findFirst({
      where: { id: itemInput.productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    const item = CartItemSchema.parse({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      qty: itemInput.qty,
      image: product.images[0],
      price: product.price.toString(),
    });

    // 6. If no cart exists, create a new one.
    if (!cart) {
      const prices = await calcPrice([item]);
      const newCartData = InsertCartSchema.parse({
        userId,
        items: [item],
        sessionCartId,
        ...prices,
      });

      await prisma.cart.create({
        data: newCartData,
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    }

    // 7. If a cart exists, update it.
    const existingItems = cart.items as CartItem[];
    const existingItem = existingItems.find(
      (i) => i.productId === item.productId
    );

    if (existingItem) {
      // Ensure the resulting quantity doesn't exceed stock.
      if (product.stock < existingItem.qty + item.qty) {
        throw new Error("Not enough stock");
      }
      existingItem.qty += item.qty;
    } else {
      // For a new item, ensure there's enough stock.
      if (product.stock < item.qty) {
        throw new Error("Not enough stock");
      }
      cart.items.push(item);
    }

    // 8. Update the cart in the database with the new items and recalculated prices.
    const updatedPrices = await calcPrice(cart.items as CartItem[]);
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...updatedPrices,
      },
    });

    // 9. Revalidate the product page.
    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} ${
        existingItem ? "updated in" : "added to"
      } cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: await formatErrors(error),
    };
  }
}

// Get my cart should return the cart of the user or the session cart
export const getMyCart = async () => {
  const cartLookup = await getCartLookup();
  if (!cartLookup) return undefined;

  // get cart from database
  const cart = await prisma.cart.findFirst({
    where: cartLookup.where,
  });

  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    sessionCartId: cart.sessionCartId ?? "",
    userId: cart.userId ?? undefined,
  });
};

// Return only the aggregate quantity needed by the header. The full cart stays
// on the server and is never sent to the header during the initial render.
export const getCartItemCount = async (): Promise<number> => {
  const cartLookup = await getCartLookup();
  if (!cartLookup) return 0;

  const cart = await prisma.cart.findFirst({
    where: cartLookup.where,
    select: { items: true },
  });

  if (!cart || !Array.isArray(cart.items)) return 0;

  const items = cart.items as unknown[];
  return items.reduce<number>((total, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return total;

    const quantity = (item as { qty?: unknown }).qty;
    return typeof quantity === "number" && Number.isFinite(quantity)
      ? total + quantity
      : total;
  }, 0);
};

// Product pages need one item quantity for their controls, not the whole cart.
export const getCartItemQuantity = async (productId: string): Promise<number> => {
  const cartLookup = await getCartLookup();
  if (!cartLookup) return 0;

  const cart = await prisma.cart.findFirst({
    where: cartLookup.where,
    select: { items: true },
  });

  if (!cart || !Array.isArray(cart.items)) return 0;

  const item = cart.items.find(
    (cartItem) =>
      cartItem &&
      typeof cartItem === "object" &&
      !Array.isArray(cartItem) &&
      (cartItem as { productId?: unknown }).productId === productId
  );

  const quantity =
    item && typeof item === "object" && !Array.isArray(item)
      ? (item as { qty?: unknown }).qty
      : undefined;

  return typeof quantity === "number" && Number.isFinite(quantity)
    ? quantity
    : 0;
};

// remove item from cart
export const removeItemFromCart = async (productId: string) => {
  try {
    // Get product from database
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Resolve the authenticated user's cart or the guest session cart.
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Get cart items
    const items = cart.items as CartItem[];

    // Find item to remove
    const existingItem = items.find((item) => item.productId === productId);
    if (!existingItem) throw new Error("Item not found in cart");

    // Update item quantity or remove item
    let updatedItems: CartItem[];
    if (existingItem.qty === 1) {
      updatedItems = items.filter((item) => item.productId !== productId);
    } else {
      updatedItems = items.map((item) =>
        item.productId === productId ? { ...item, qty: item.qty - 1 } : item
      );
    }

    // Update cart in databases
    const updatedPrices = await calcPrice(updatedItems);
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: updatedItems as Prisma.CartUpdateitemsInput[],
        ...updatedPrices,
      },
    });

    // Revalidate product page
    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: `${product.name} removed from cart` };
  } catch (error) {
    return { success: false, message: await formatErrors(error) };
  }
};
