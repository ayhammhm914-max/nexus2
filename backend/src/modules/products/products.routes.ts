import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rateLimiters } from "../../middleware/rateLimit.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { productsController } from "./products.controller";
import {
  createProductSchema,
  importKeysSchema,
  productIdSchema,
  productQuerySchema,
  productSlugSchema,
  updateProductSchema
} from "./products.schema";

export const productsRoutes = Router();
export const adminProductsRoutes = Router();

productsRoutes.get("/", validate(productQuerySchema), asyncHandler(productsController.list));
productsRoutes.get("/featured", asyncHandler(productsController.featured));
productsRoutes.get("/hot-deals", asyncHandler(productsController.hotDeals));
productsRoutes.get("/new-arrivals", asyncHandler(productsController.newArrivals));
productsRoutes.get("/:slug", validate(productSlugSchema), asyncHandler(productsController.bySlug));
productsRoutes.get("/:id/related", validate(productIdSchema), asyncHandler(productsController.related));

adminProductsRoutes.use(authMiddleware, requireRole("ADMIN", "SUPERADMIN"), rateLimiters.admin);
adminProductsRoutes.post("/", validate(createProductSchema), asyncHandler(productsController.create));
adminProductsRoutes.put("/:id", validate({ ...productIdSchema, ...updateProductSchema }), asyncHandler(productsController.update));
adminProductsRoutes.delete("/:id", validate(productIdSchema), asyncHandler(productsController.remove));
adminProductsRoutes.post("/:id/keys", validate(importKeysSchema), asyncHandler(productsController.importKeys));
