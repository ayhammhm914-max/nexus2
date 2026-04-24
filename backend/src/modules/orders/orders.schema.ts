import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const checkoutSchema = {
  body: z
    .object({
      guestEmail: z.string().email().optional(),
      paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.STRIPE),
      couponCode: z.string().trim().min(3).optional(),
      items: z
        .array(
          z.object({
            productId: z.string().uuid(),
            quantity: z.coerce.number().min(1).max(10)
          })
        )
        .min(1)
    })
    .strict()
};

export const orderIdSchema = {
  params: z
    .object({
      id: z.string().uuid()
    })
    .strict()
};

export const orderNumberSchema = {
  params: z
    .object({
      orderNumber: z.string().min(3)
    })
    .strict()
};

export const messageBodySchema = {
  body: z
    .object({
      reason: z.string().min(10).max(1000)
    })
    .strict()
};

