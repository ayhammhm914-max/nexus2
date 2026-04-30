import type { Response } from "express";
import type { CookieOptions } from "express-serve-static-core";
import { env } from "../config/env";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
  path: "/"
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
};

export const oauthCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: `/api/${env.API_VERSION}/auth`
};

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, accessTokenCookieOptions);
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, refreshTokenCookieOptions);
};

export const clearTokenCookies = (res: Response) => {
  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);
};

export const setOAuthCookies = (
  res: Response,
  provider: string,
  values: { state: string; nonce: string }
) => {
  res.cookie(`oauth_${provider}_state`, values.state, oauthCookieOptions);
  res.cookie(`oauth_${provider}_nonce`, values.nonce, oauthCookieOptions);
};

export const clearOAuthCookies = (res: Response, provider: string) => {
  res.clearCookie(`oauth_${provider}_state`, oauthCookieOptions);
  res.clearCookie(`oauth_${provider}_nonce`, oauthCookieOptions);
};
