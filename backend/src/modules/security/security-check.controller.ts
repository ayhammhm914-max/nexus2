import type { Request, Response } from "express";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { successResponse } from "../../utils/response.utils";

const SECURITY_HEADERS = [
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "x-xss-protection",
  "strict-transport-security",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-embedder-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy"
];

const resolveOrigin = (req: Request) => {
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  return `${protocol}://${req.get("host")}`;
};

export const securityCheckController = {
  headers: async (req: Request, res: Response) => {
    const origin = resolveOrigin(req);
    const targetUrl = `${origin}/api/${env.API_VERSION}/health`;
    const response = await fetch(targetUrl, {
      headers: {
        accept: "application/json"
      }
    });

    const report = Object.fromEntries(
      SECURITY_HEADERS.map((header) => {
        const value = response.headers.get(header);
        return [
          header,
          {
            present: Boolean(value),
            value
          }
        ];
      })
    );

    return res.json(
      successResponse({
        targetUrl,
        ok: response.ok,
        status: response.status,
        headers: report
      })
    );
  },

  testXss: async (req: Request, res: Response) => {
    if (env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "XSS testing endpoint is disabled in production."
        }
      });
    }

    return res.json(
      successResponse({
        payload: req.body,
        warning: "This response intentionally skips sanitization in non-production environments."
      })
    );
  },

  testCors: async (req: Request, res: Response) => {
    const origin = req.get("origin") ?? "unknown";

    logger.info(
      JSON.stringify({
        event: "SECURITY_CORS_TEST",
        origin,
        ip: req.ip
      })
    );

    return res.json(
      successResponse({
        origin,
        ip: req.ip,
        method: req.method
      })
    );
  }
};
