import type { Request, Response } from "express";
import { authService } from "./auth.service";
import {
  clearOAuthCookies,
  clearTokenCookies,
  setAccessTokenCookie,
  setOAuthCookies,
  setRefreshTokenCookie
} from "../../middleware/auth-cookie.middleware";
import { env } from "../../config/env";
import { errorResponse, successResponse } from "../../utils/response.utils";
import { oidcService } from "./oidc.service";

const frontendUrl = (path: string) => new URL(path, env.FRONTEND_URL).toString();

export const authController = {
  me: async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.sub);
    return res.json(successResponse({ user }, "Authenticated user."));
  },

  register: async (req: Request, res: Response) => {
    const result = await authService.register(req.body, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(201).json(
      successResponse(
        {
          user: result.user
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

    if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
      return res.status(202).json(
        successResponse(
          {
            requiresTwoFactor: true
          },
          "Two-factor authentication code required."
        )
      );
    }

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return res.json(
      successResponse(
        {
          user: result.user
        },
        "Login successful."
      )
    );
  },

  logout: async (req: Request, res: Response) => {
    await authService.logout(req);
    clearTokenCookies(res);
    return res.json(successResponse(null, "Logged out successfully."));
  },

  refresh: async (req: Request, res: Response) => {
    const result = await authService.refresh(req);
    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return res.json(
      successResponse(
        {
          user: result.user
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

  startGoogleOAuth: async (_req: Request, res: Response) => {
    const { authorizationUrl, state, nonce } = await oidcService.createGoogleAuthorizationUrl();
    setOAuthCookies(res, "google", { state, nonce });
    return res.redirect(authorizationUrl);
  },

  googleOAuthCallback: async (req: Request, res: Response) => {
    try {
      const state = req.cookies.oauth_google_state as string | undefined;
      const nonce = req.cookies.oauth_google_nonce as string | undefined;

      if (!state || !nonce) {
        throw new Error("Google OAuth state is missing or expired.");
      }

      const profile = await oidcService.verifyGoogleCallback(req, { state, nonce });
      const result = await authService.loginWithOAuth(profile, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });

      setAccessTokenCookie(res, result.accessToken);
      setRefreshTokenCookie(res, result.refreshToken);
      clearOAuthCookies(res, "google");
      return res.redirect(frontendUrl("/dashboard?oauth=google"));
    } catch {
      clearOAuthCookies(res, "google");
      return res.redirect(frontendUrl("/login?oauth=failed"));
    }
  },

  startAppleOAuth: async (_req: Request, res: Response) => {
    return res.status(501).json(
      errorResponse(
        "APPLE_SIGN_IN_DISABLED",
        "Apple Sign in requires Apple Developer configuration before it can be enabled."
      )
    );
  },

  appleOAuthCallback: async (_req: Request, res: Response) => {
    return res.redirect(frontendUrl("/login?oauth=apple-disabled"));
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
    await authService.disableTwoFactor(req.user!.sub, req.body.password, req.body.token);
    return res.json(successResponse(null, "Two-factor authentication disabled."));
  }
};
