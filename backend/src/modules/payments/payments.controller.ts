import type { Request, Response } from "express";
import { stripe } from "../../config/stripe";
import { redis } from "../../config/redis";
import { ordersService } from "../orders/orders.service";

export const paymentsController = {
  stripeWebhook: async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    const timestampHeader = req.headers["stripe-timestamp"];

    if (typeof signature !== "string") {
      return res.status(400).send("Missing Stripe signature.");
    }

    const signatureTimestamp =
      typeof timestampHeader === "string"
        ? Number.parseInt(timestampHeader, 10)
        : Number.parseInt(signature.split(",").find((part) => part.trim().startsWith("t="))?.split("=")[1] ?? "", 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Rejecting stale webhook timestamps narrows the replay window for captured webhook payloads.
    if (
      Number.isNaN(signatureTimestamp) ||
      Math.abs(currentTimestamp - signatureTimestamp) > 300
    ) {
      return res.status(400).send("Webhook timestamp too old");
    }

    let event: ReturnType<typeof stripe.webhooks.constructEvent>;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch {
      return res.status(400).send("Invalid Stripe signature.");
    }

    const idempotencyKey = `nexus:webhook:${event.id}`;
    const alreadyProcessed = await redis.get(idempotencyKey);
    if (alreadyProcessed) {
      return res.json({ received: true, duplicate: true });
    }

    // Idempotency tracking prevents duplicate deliveries from triggering the same payment workflow twice.
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
