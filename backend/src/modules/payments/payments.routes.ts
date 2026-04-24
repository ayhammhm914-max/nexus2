import express from "express";
import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { paymentsController } from "./payments.controller";

export const paymentsRoutes = Router();

paymentsRoutes.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(paymentsController.stripeWebhook)
);
