import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import DOMPurify from "isomorphic-dompurify";
import { env } from "../config/env";
import { errorResponse } from "../utils/response.utils";

const sqlPattern = /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b|\btruncate\b|--|;)/i;
const sanitizeBypassPaths = new Set([
  `/api/${env.API_VERSION}/security/test-xss`
]);

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

const permissionsPolicy = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), usb=(), payment=()"
  );
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
};

const basicThreatDetection = (req: Request, res: Response, next: NextFunction) => {
  if (sanitizeBypassPaths.has(req.path) && env.NODE_ENV !== "production") {
    return next();
  }

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
      useDefaults: false,
      directives: {
        // Default to same-origin loading unless a directive explicitly allows a service.
        "default-src": ["'self'"],
        // Stripe.js and Cloudflare challenges are the only third-party scripts allowed.
        "script-src": ["'self'", "https://js.stripe.com", "https://challenges.cloudflare.com"],
        // Block inline style attributes while still allowing Google Fonts stylesheets.
        "style-src": ["'self'", "https://fonts.googleapis.com"],
        "style-src-attr": ["'none'"],
        "style-src-elem": ["'self'", "https://fonts.googleapis.com"],
        // Only local fonts and Google font files are trusted.
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        // Product images can come from HTTPS CDNs/S3, local assets, data placeholders, or blobs.
        "img-src": ["'self'", "data:", "https:", "blob:"],
        // API calls stay same-origin, plus Stripe and the configured storefront origin.
        "connect-src": ["'self'", "https://api.stripe.com", env.FRONTEND_URL],
        // Stripe payment frames are allowed; all other framing stays blocked.
        "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        // Forms can only submit back to this app.
        "form-action": ["'self'"],
        // Prevent clickjacking by blocking this app from being embedded.
        "frame-ancestors": ["'none'"],
        // Prevent attackers from changing relative URL resolution with a base tag.
        "base-uri": ["'self'"],
        // Block plugin/object execution surfaces.
        "object-src": ["'none'"],
        // Send CSP violation reports to the backend for security monitoring.
        "report-uri": [`/api/${env.API_VERSION}/csp-report`]
      }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    frameguard: { action: "deny" },
    hsts: {
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }),
  permissionsPolicy,
  hpp(),
  basicThreatDetection
];
