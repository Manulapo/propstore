'use server';

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { freeShippingMinValue, shippingPriceValue, taxRate } from "../constants";
import { convertPrismaObj, formatErrors, roundNumber } from "../utils";
import { cartItemSchema, InsertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// calculate cart prices
export const calcPrices = async (items: CartItem[]) => {
    // calculate prices of every item in the cart
    const itemsPrice = items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);

    // calculate shipping price
    const shippingPrice = roundNumber(itemsPrice) > freeShippingMinValue ? 0 : shippingPriceValue;

    // calculate tax, shipping and total price
    const taxPrice = roundNumber(itemsPrice * taxRate);
    const totalPrice = roundNumber(itemsPrice + taxPrice + shippingPrice);

    console.table({ itemsPrice, taxPrice, shippingPrice, totalPrice });

    return {
        itemsPrice: itemsPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
    };
}

// Add item to cart should both add the item to the cart and return a response with a success message or an error message and the cart items
export async function addItemToCart(data: CartItem) {
    try {
      // Check for cart cookie
      const sessionCartId = (await cookies()).get('sessionCartId')?.value;
      if (!sessionCartId) throw new Error('Cart session not found');
  
      // Get session and user ID
      const session = await auth();
      const userId = session?.user?.id ? (session.user.id as string) : undefined;
  
      // Get cart
      const cart = await getMyCart();
  
      // Parse and validate item
      const item = cartItemSchema.parse(data);
  
      // Find product in database
      const product = await prisma.product.findFirst({
        where: { id: item.productId },
      });
      if (!product) throw new Error('Product not found');
  
      if (!cart) {
        // Create new cart object
        const prices = await calcPrices([item]);

        const newCart = InsertCartSchema.parse({
            userId: userId,
            items: [item],
            sessionCartId: sessionCartId,
            ...prices,
        });

        // Add to database
        await prisma.cart.create({
          data: newCart,
        });

        // Revalidate product page
        revalidatePath(`/product/${product.slug}`);
  
        return {
          success: true,
          message: `${product.name} added to cart`,
        };
      } else {
        // Check if item is already in cart
        const existItem = (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        );
  
        if (existItem) {
          // Check stock
          if (product.stock < existItem.qty + 1) {
            throw new Error('Not enough stock');
          }
  
          // Increase the quantity
          (cart.items as CartItem[]).find(
            (x) => x.productId === item.productId
          )!.qty = existItem.qty + 1;
        } else {
          // If item does not exist in cart
          // Check stock
          if (product.stock < 1) throw new Error('Not enough stock');
  
          // Add item to the cart.items
          cart.items.push(item);
        }
  
        // Save to database
        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: cart.items as Prisma.CartUpdateitemsInput[],
            ...calcPrices(cart.items as CartItem[]),
          },
        });
  
        revalidatePath(`/product/${product.slug}`);
  
        return {
          success: true,
          message: `${product.name} ${
            existItem ? 'updated in' : 'added to'
          } cart`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: formatErrors(error),
      };
    }
  }


// Get my cart should return the cart of the user or the session cart
export const getMyCart = async () => {
    // check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value; // get cookie value

    if (!sessionCartId) throw new Error('Session cart ID not found');

    // get session and user id
    const session = await auth();
    const userId = session?.user?.id ? session?.user?.id as string : undefined; // get user id or undefined if the user is not logged in
    // get cart from database
    const cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionCartId }, // if user is logged in, get cart by user id, else get cart by session cart id
    });

    if (!cart) return undefined;

    return convertPrismaObj({
        ...cart,
        itemsPrice: cart.itemsPrice.toString(),
        taxPrice: cart.taxPrice.toString(),
        shippingPrice: cart.shippingPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
    })
}
