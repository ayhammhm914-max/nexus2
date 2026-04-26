import express, { Router } from "express";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { ensureCsrfToken } from "../../middleware/csrf.middleware";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { successResponse } from "../../utils/response.utils";
import { securityCheckController } from "./security-check.controller";

export const securityRoutes = Router();

securityRoutes.post(
  "/csp-report",
  express.json({ type: ["application/csp-report", "application/reports+json", "application/json"] }),
  asyncHandler(async (req, res) => {
    const report = req.body?.["csp-report"] ?? req.body ?? {};

    logger.warn(
      JSON.stringify({
        event: "CSP_VIOLATION",
        documentUri: report["document-uri"],
        violatedDirective: report["violated-directive"],
        originalPolicy: report["original-policy"],
        blockedUri: report["blocked-uri"],
        ip: req.ip
      })
    );

    return res.status(204).send();
  })
);

securityRoutes.get(
  "/.well-known/security.txt",
  asyncHandler(async (_req, res) => {
    // A clear disclosure channel helps researchers report issues responsibly instead of going public first.
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const lines = [
      `Contact: ${env.SECURITY_CONTACT_EMAIL}`,
      `Expires: ${expires}`,
      "Preferred-Languages: en",
      `Policy: ${env.SECURITY_POLICY_URL}`,
      `Canonical: ${env.SECURITY_CANONICAL_URL}`
    ];

    return res.type("text/plain").send(lines.join("\n"));
  })
);

securityRoutes.get(
  "/csrf",
  asyncHandler(async (req, res) => {
    const csrfToken = ensureCsrfToken(req, res);
    return res.json(successResponse({ csrfToken }));
  })
);

securityRoutes.get("/security/headers", asyncHandler(securityCheckController.headers));
securityRoutes.post("/security/test-xss", asyncHandler(securityCheckController.testXss));
securityRoutes.post("/security/test-cors", asyncHandler(securityCheckController.testCors));
