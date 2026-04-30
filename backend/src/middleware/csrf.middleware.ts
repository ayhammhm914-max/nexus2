import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { timingSafeCompare } from "../utils/crypto.utils";
import { errorResponse } from "../utils/response.utils";

const csrfBypassPaths = new Set([
  `/api/${env.API_VERSION}/payments/stripe/webhook`,
  `/api/${env.API_VERSION}/csp-report`,
  `/api/${env.API_VERSION}/auth/apple/callback`
]);

const hashCSRFToken = (token: string) =>
  crypto.createHmac("sha256", env.CSRF_SECRET).update(token).digest("hex");

const attachToken = (res: Response, token: string) => {
  const tokenHash = hashCSRFToken(token);

  res.cookie("csrf-token", token, {
    httpOnly: false,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/"
  });

  res.cookie("csrf-secret", tokenHash, {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/"
  });

  res.setHeader("X-CSRF-Token", token);
  res.locals.csrfToken = token;
};

export const generateCSRFToken = () => crypto.randomBytes(32).toString("hex");

export const verifyCSRFToken = (token: string, storedHash: string) =>
  timingSafeCompare(hashCSRFToken(token), storedHash);

export const ensureCsrfToken = (req: Request, res: Response) => {
  const existingToken = req.cookies["csrf-token"];
  const existingHash = req.cookies["csrf-secret"];

  if (
    typeof existingToken === "string" &&
    typeof existingHash === "string" &&
    verifyCSRFToken(existingToken, existingHash)
  ) {
    attachToken(res, existingToken);
    return existingToken;
  }

  const freshToken = generateCSRFToken();
  attachToken(res, freshToken);
  return freshToken;
};

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (csrfBypassPaths.has(req.path)) {
    return next();
  }

  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    ensureCsrfToken(req, res);
    return next();
  }

  const requestToken =
    (typeof req.headers["x-csrf-token"] === "string" && req.headers["x-csrf-token"]) ||
    (typeof req.body?.csrfToken === "string" && req.body.csrfToken) ||
    (typeof req.body?._csrf === "string" && req.body._csrf);
  const storedHash = req.cookies["csrf-secret"];

  if (
    typeof requestToken !== "string" ||
    typeof storedHash !== "string" ||
    !verifyCSRFToken(requestToken, storedHash)
  ) {
    return res
      .status(403)
      .json(errorResponse("CSRF_INVALID", "Invalid CSRF token."));
  }

  return next();
};
