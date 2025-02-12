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
    name: z.string().min(3, 'Name must be at least 3 characters').max(255),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});