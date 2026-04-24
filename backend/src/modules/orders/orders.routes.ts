import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rateLimiters } from "../../middleware/rateLimit.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { ordersController } from "./orders.controller";
import {
  checkoutSchema,
  messageBodySchema,
  orderIdSchema,
  orderNumberSchema
} from "./orders.schema";

export const ordersRoutes = Router();

ordersRoutes.post("/checkout", rateLimiters.checkout, validate(checkoutSchema), asyncHandler(ordersController.checkout));
ordersRoutes.get("/", authMiddleware, asyncHandler(ordersController.list));
ordersRoutes.get("/:orderNumber", authMiddleware, validate(orderNumberSchema), asyncHandler(ordersController.detail));
ordersRoutes.post("/:id/cancel", authMiddleware, validate(orderIdSchema), asyncHandler(ordersController.cancel));
ordersRoutes.post(
  "/:id/refund-request",
  authMiddleware,
  validate({ ...orderIdSchema, ...messageBodySchema }),
  asyncHandler(ordersController.refundRequest)
);
ordersRoutes.post(
  "/:id/dispute",
  authMiddleware,
  validate({ ...orderIdSchema, ...messageBodySchema }),
  asyncHandler(ordersController.dispute)
);
