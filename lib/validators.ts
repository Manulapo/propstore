//Schemafor inserting products

import { z } from "zod";
import { formatPrice } from "./utils";
import { PAYMENT_METHODS } from "./constants";

const currency = z.string().refine((value) => {
  const CURRENCY_REGEX = /^\d+(\.\d{2})?$/;
  const isMatching = CURRENCY_REGEX.test(formatPrice(Number(value)));
  return isMatching;
}, "Price must have exactly two decimal places");

export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at list 3 characters").max(255),
  slug: z.string().min(3, "Slug must be at list 3 characters").max(255),
  brand: z.string().min(3, "Brand must be at list 3 characters").max(255),
  stock: z.coerce.number().min(0, "Stock must be a positive integer"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for sign in form
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for sign up form
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Cart item schema
export const CartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(3, "Name is required"),
  slug: z.string().min(3, "Slug is required"),
  qty: z.number().int().nonnegative("Quantity must be a positive number"),
  image: z.string().min(1, "Image is required"),
  price: currency,
});

// Cart schema
export const InsertCartSchema = z.object({
  items: z.array(CartItemSchema).min(1, "At least one item is required"),
  itemsPrice: currency,
  taxPrice: currency,
  shippingPrice: currency,
  totalPrice: currency,
  sessionCartId: z.string().min(1, "Session cart ID is required"),
  userId: z.string().optional(), // user can add items to cart without being logged in but then we need to associate the cart with a user when they go further in the checkout process
});

// shipping address

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  streetAddress: z
    .string()
    .min(3, "Street address must be at least 3 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  lat: z.number().optional(), // optional to get a map of the address
  lng: z.number().optional(), // optional to get a map of the address
});

// schema for payment method
export const PaymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    // refine check if the payment method is one of the allowed payment methods
    path: ["type"], // path here is the key of the object that failed the check
    message: "Invalid payment method",
  });

// schema for inserting an order
export const InsertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currency,
  taxPrice: currency,
  shippingPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddress: ShippingAddressSchema,
});

// schema for insertingAnOrderItem
export const InsertOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  image: z.string().min(1, "Image is required"),
  qty: z.number().int().nonnegative("Quantity must be a positive number"),
  price: currency,
});
