import type { Request, Response } from "express";
import { stripe } from "../../config/stripe";
import { redis } from "../../config/redis";
import { ordersService } from "../orders/orders.service";

export const paymentsController = {
  stripeWebhook: async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    if (typeof signature !== "string") {
      return res.status(400).send("Missing Stripe signature.");
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    const idempotencyKey = `nexus:webhook:${event.id}`;
    const alreadyProcessed = await redis.get(idempotencyKey);
    if (alreadyProcessed) {
      return res.json({ received: true, duplicate: true });
    }

    if (event.type === "payment_intent.succeeded") {
      await ordersService.completeOrderFromPaymentIntent(event.data.object.id);
    }

    if (event.type === "payment_intent.payment_failed") {
      await ordersService.failOrderFromPaymentIntent(event.data.object.id);
    }

    await redis.setEx(idempotencyKey, 24 * 60 * 60, "processed");

    return res.json({ received: true });
  }
};

