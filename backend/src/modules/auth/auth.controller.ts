import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { successResponse } from "../../utils/response.utils";

export const authController = {
  register: async (req: Request, res: Response) => {
    const result = await authService.register(req.body, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    authService.attachRefreshCookie(res, result.refreshToken);

    return res.status(201).json(
      successResponse(
        {
          user: result.user,
          accessToken: result.accessToken
        },
        "Registration successful."
      )
    );
  },

  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    authService.attachRefreshCookie(res, result.refreshToken);

    return res.json(
      successResponse(
        {
          user: result.user,
          accessToken: result.accessToken
        },
        "Login successful."
      )
    );
  },

  logout: async (req: Request, res: Response) => {
    await authService.logout(req);
    authService.clearRefreshCookie(res);
    return res.json(successResponse(null, "Logged out successfully."));
  },

  refresh: async (req: Request, res: Response) => {
    const result = await authService.refresh(req);
    authService.attachRefreshCookie(res, result.refreshToken);

    return res.json(
      successResponse(
        {
          user: result.user,
          accessToken: result.accessToken
        },
        "Session refreshed."
      )
    );
  },

  verifyEmail: async (req: Request, res: Response) => {
    await authService.verifyEmail(String(req.params.token));
    return res.json(successResponse(null, "Email verified successfully."));
  },

  forgotPassword: async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    return res.json(
      successResponse(null, "If the account exists, a reset email has been sent.")
    );
  },

  resetPassword: async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    return res.json(successResponse(null, "Password reset successful."));
  },

  setupTwoFactor: async (req: Request, res: Response) => {
    const result = await authService.setupTwoFactor(req.user!.sub);
    return res.json(successResponse(result, "2FA setup generated."));
  },

  verifyTwoFactor: async (req: Request, res: Response) => {
    const result = await authService.verifyTwoFactor(req.user!.sub, String(req.body.token));
    return res.json(successResponse(result, "Two-factor authentication enabled."));
  },

  disableTwoFactor: async (req: Request, res: Response) => {
    await authService.disableTwoFactor(req.user!.sub, req.body.password);
    return res.json(successResponse(null, "Two-factor authentication disabled."));
  }
};
