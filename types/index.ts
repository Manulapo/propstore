import { CartItemSchema, InsertCartSchema, insertProductSchema, ShippingAddressSchema } from "@/lib/validators";
import { z } from "zod";

// creating types from the zod schemas i created in lib/validators.ts
export type ProductType = z.infer<typeof insertProductSchema> & {
    id: string;
    rating: string;
    createdAt: Date;
};

// from zod schema to types of typescript
export type Cart = z.infer<typeof InsertCartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;