import {
  CartItemSchema,
  InsertCartSchema,
  InsertOrderItemSchema,
  InsertOrderSchema,
  insertProductSchema,
  insertReviewSchema,
  paymentResultSchema,
  ShippingAddressSchema,
} from "@/lib/validators";
import { OrderItem } from "@prisma/client";
import { z } from "zod";

// creating types from the zod schemas i created in lib/validators.ts
export type ProductType = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
  numReviews: number;
};

export type OrderItemWithStringPrice = Omit<OrderItem, "price"> & {
  price: string;
};

export type Order = z.infer<typeof InsertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItemWithStringPrice[];
  paymentResult: PaymentResult;
  user: { name: string; email: string };
};

// from zod schema to types of typescript
export type Cart = z.infer<typeof InsertCartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type InsertOrder = z.infer<typeof InsertOrderSchema>;
export type InsertOrderItem = z.infer<typeof InsertOrderItemSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user: { name: string };
};
