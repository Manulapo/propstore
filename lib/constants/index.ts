import { ShippingAddress } from "@/types";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "PropStore";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Modern e-commerce for your favorite movies and TV shows.";
export const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SERVER_URL
    : "http://localhost:3000";
export const LATEST_PRODCUCT_LIMIT =
  Number(process.env.NEXT_PUBLIC_LATEST_PRODUCT_LIMIT) || 4;
export const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "€";
export const CURRENCY_CODE = process.env.NEXT_PUBLIC_CURRENCY_CODE || "EUR";

// Default values for sign in form testing
export const signInCredentialsDefaultValues = {
  email: "admin@example.com",
  password: "123456",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const freeShippingMinValue = 100;
export const shippingPriceValue = 10;
export const taxRate = 0.22;

export const shippingAddressDefaultValues: ShippingAddress = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
  lat: 0,
  lng: 0,
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(",")
  : ["PayPal", "Stripe", "CashOnDelivery"];
export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 2;

export const productDefaultValues = {
  name: "",
  slug: "",
  images: [],
  price: "0",
  brand: "",
  category: "",
  stock: 0,
  description: "",
  rating: "0",
  isFeatured: false,
  banner: null,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(",")
  : ["user", "admin"];

export const reviewFormDefaultValues = {
  rating: 0,
  comment: "",
  productId: "",
};

export const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";
