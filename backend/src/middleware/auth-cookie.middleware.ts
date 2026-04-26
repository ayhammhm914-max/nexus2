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
