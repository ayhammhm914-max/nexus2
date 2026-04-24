import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rateLimiters } from "../../middleware/rateLimit.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { authController } from "./auth.controller";
import {
  disableTwoFactorSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyTokenSchema,
  verifyTwoFactorSchema
} from "./auth.schema";

export const authRoutes = Router();

authRoutes.post("/register", rateLimiters.register, validate(registerSchema), asyncHandler(authController.register));
authRoutes.post("/login", rateLimiters.login, validate(loginSchema), asyncHandler(authController.login));
authRoutes.post("/logout", authMiddleware, asyncHandler(authController.logout));
authRoutes.post("/refresh", rateLimiters.refresh, asyncHandler(authController.refresh));
authRoutes.get("/verify-email/:token", validate(verifyTokenSchema), asyncHandler(authController.verifyEmail));
authRoutes.post(
  "/forgot-password",
  rateLimiters.forgotPassword,
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);
authRoutes.post("/reset-password", validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
authRoutes.post("/2fa/setup", authMiddleware, asyncHandler(authController.setupTwoFactor));
authRoutes.post(
  "/2fa/verify",
  authMiddleware,
  validate(verifyTwoFactorSchema),
  asyncHandler(authController.verifyTwoFactor)
);
authRoutes.post(
  "/2fa/disable",
  authMiddleware,
  validate(disableTwoFactorSchema),
  asyncHandler(authController.disableTwoFactor)
);
