import { cartItemSchema, InsertCartSchema, insertProductSchema } from "@/lib/validators";
import { z } from "zod";

// creating types from the zod schemas i created in lib/validators.ts

export type ProductType = z.infer<typeof insertProductSchema> & {
    id: string;
    rating: string;
    createdAt: Date;
};

export type CartType = z.infer<typeof InsertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;