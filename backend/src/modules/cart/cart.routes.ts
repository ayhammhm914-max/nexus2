import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { cartController } from "./cart.controller";
import {
  addCartItemSchema,
  cartItemParamSchema,
  updateCartItemSchema
} from "./cart.schema";

export const cartRoutes = Router();

cartRoutes.use(authMiddleware);
cartRoutes.get("/", asyncHandler(cartController.get));
cartRoutes.post("/items", validate(addCartItemSchema), asyncHandler(cartController.addItem));
cartRoutes.put("/items/:productId", validate(updateCartItemSchema), asyncHandler(cartController.updateItem));
cartRoutes.delete("/items/:productId", validate(cartItemParamSchema), asyncHandler(cartController.removeItem));
cartRoutes.delete("/", asyncHandler(cartController.clear));
cartRoutes.post("/validate", asyncHandler(cartController.validate));
