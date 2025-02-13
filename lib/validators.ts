//Schemafor inserting products

import { z } from "zod";
import { formatPrice } from "./utils";

const currency = z.string().refine((value) => /^\d+(\\.\d{2})?$/.test(formatPrice(Number(value))), 'Price must be a valid number')

export const insertProductSchema = z.object({
    name: z.string().min(3, 'Name must be at list 3 characters').max(255),
    slug: z.string().min(3, 'Slug must be at list 3 characters').max(255),
    brand: z.string().min(3, 'Brand must be at list 3 characters').max(255),
    stock: z.coerce.number().min(0, 'Stock must be a positive integer'),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency,
});

// Schema for sign in form
export const signInFormSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Schema for sign up form
export const signUpFormSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

// Cart item schema
export const cartItemSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    name: z.string().min(3, 'Name is required'),
    slug: z.string().min(3, 'Slug is required'),
    qty: z.number().int().nonnegative('Quantity must be a positive number'),
    image: z.string().min(1, 'Image is required'),
    price: currency,
});

// Cart schema
export const InsertCartSchema = z.object({
    items: z.array(cartItemSchema).min(1, 'At least one item is required'),
    itemsPrice: currency,
    taxPrice: currency,
    shippingPrice: currency,
    totalPrice: currency,
    sessionCartId: z.string().min(1, 'Session cart ID is required'),
    userId: z.string().optional(), // user can add items to cart without being logged in but then we need to associate the cart with a user when they go further in the checkout process
});

