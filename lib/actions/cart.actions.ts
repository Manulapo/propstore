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
import { CartItemSchema, InsertCartSchema } from "../validators";

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

    // 4. Validate and parse the incoming cart item data.
    const item = CartItemSchema.parse(data);

    // 5. Retrieve the product from the database.
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

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
      // Ensure adding one more doesn't exceed stock.
      if (product.stock < existingItem.qty + 1) {
        throw new Error("Not enough stock");
      }
      existingItem.qty += 1;
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
  // check for cart cookie
  const sessionCartId = (await cookies()).get("sessionCartId")?.value; // get cookie value

  if (!sessionCartId) return undefined; // if no cart cookie, return undefined

  // get session and user id
  const session = await auth();
  const userId = session?.user?.id ? (session?.user?.id as string) : undefined; // get user id or undefined if the user is not logged in
  // get cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId }, // if user is logged in, get cart by user id, else get cart by session cart id
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

// remove item from cart
export const removeItemFromCart = async (productId: string) => {
  try {
    // Check for cart cookies
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    // Get product from database
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Get cart from database
    const cart = await prisma.cart.findFirst({
      where: { sessionCartId },
    });
    if (!cart) throw new Error("Cart not found");

    // Get cart items
    const items = cart.items as CartItem[];

    // Find item to remove
    const existingItem = items.find((item) => item.productId === productId);
    if (!existingItem) throw new Error("Item not found in cart");

    // Update item quantity or remove item
    if (existingItem.qty === 1) {
      cart.items = items.filter((item) => item.productId !== productId);
    } else {
      existingItem.qty -= 1;
    }

    // Update cart in databases
    const updatedPrices = await calcPrice(cart.items as CartItem[]);
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
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
