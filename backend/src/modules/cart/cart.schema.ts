import { z } from "zod";

export const addCartItemSchema = {
  body: z
    .object({
      productId: z.string().uuid(),
      quantity: z.coerce.number().min(1).max(10)
    })
    .strict()
};

export const updateCartItemSchema = {
  params: z
    .object({
      productId: z.string().uuid()
    })
    .strict(),
  body: z
    .object({
      quantity: z.coerce.number().min(1).max(10)
    })
    .strict()
};

export const cartItemParamSchema = {
  params: z
    .object({
      productId: z.string().uuid()
    })
    .strict()
};

