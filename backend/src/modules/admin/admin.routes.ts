import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rateLimiters } from "../../middleware/rateLimit.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { adminController } from "./admin.controller";
import { adminSessionIdSchema } from "./admin.schema";

export const adminRoutes = Router();

adminRoutes.use(authMiddleware, requireRole("ADMIN", "SUPERADMIN"), rateLimiters.admin);

adminRoutes.get("/sessions", asyncHandler(adminController.listSessions));
adminRoutes.post("/sessions/revoke-all", asyncHandler(adminController.revokeAllSessions));
adminRoutes.post(
  "/sessions/:id/revoke",
  validate(adminSessionIdSchema),
  asyncHandler(adminController.revokeSession)
);
