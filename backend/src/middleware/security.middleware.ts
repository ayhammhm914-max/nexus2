import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import DOMPurify from "isomorphic-dompurify";
import { env } from "../config/env";
import { errorResponse } from "../utils/response.utils";

const sqlPattern = /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b|\btruncate\b|--|;)/i;

const sanitizeDeep = (value: unknown): unknown => {
  if (typeof value === "string") {
    return DOMPurify.sanitize(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeDeep(nestedValue)])
    );
  }

  return value;
};

const issueCsrfCookie = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies["csrf-seed"]) {
    const seed = crypto.randomBytes(32).toString("hex");
    res.cookie("csrf-seed", seed, {
      httpOnly: true,
      sameSite: "strict",
      secure: env.NODE_ENV === "production"
    });
    res.cookie(
      "csrf-token",
      crypto.createHmac("sha256", env.CSRF_SECRET).update(seed).digest("hex"),
      {
        httpOnly: false,
        sameSite: "strict",
        secure: env.NODE_ENV === "production"
      }
    );
  }

  next();
};

const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  const seed = req.cookies["csrf-seed"];
  const token = req.headers["x-csrf-token"];

  if (!seed || typeof token !== "string") {
    return res
      .status(403)
      .json(errorResponse("CSRF_INVALID", "Missing CSRF token."));
  }

  const expected = crypto.createHmac("sha256", env.CSRF_SECRET).update(seed).digest("hex");

  if (token !== expected) {
    return res
      .status(403)
      .json(errorResponse("CSRF_INVALID", "Invalid CSRF token."));
  }

  return next();
};

const basicThreatDetection = (req: Request, res: Response, next: NextFunction) => {
  const serialized = JSON.stringify(req.body ?? {}) + JSON.stringify(req.query ?? {});

  if (sqlPattern.test(serialized)) {
    return res
      .status(400)
      .json(errorResponse("MALICIOUS_INPUT", "Potentially malicious input detected."));
  }

  req.body = sanitizeDeep(req.body);
  next();
};

export const securityMiddleware = [
  express.json({ limit: "10mb" }),
  express.urlencoded({ extended: true, limit: "10mb" }),
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://js.stripe.com"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'", "https://api.stripe.com", env.FRONTEND_URL],
        "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"]
      }
    },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    frameguard: { action: "deny" },
    hsts: {
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }),
  hpp(),
  issueCsrfCookie,
  csrfProtection,
  basicThreatDetection
];

