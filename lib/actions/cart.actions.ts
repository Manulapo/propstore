'use server';

import { CartItem } from "@/types";

export const addItemToCart = async (data: CartItem) => {
    // Add item to cart
    console.log(data);
    return { success: true, message: '', error: '' };
}