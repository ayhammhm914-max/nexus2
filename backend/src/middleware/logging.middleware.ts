import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger";

export const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "apiKey",
  "refreshToken",
  "creditCard",
  "cvv",
  "ssn",
  "pin"
];

export const redactSensitiveData = (value: unknown, depth = 0): unknown => {
  if (depth > 5) {
    return "[MAX_DEPTH]";
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (Buffer.isBuffer(value)) {
    return "[BUFFER]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => {
      const isSensitive = SENSITIVE_FIELDS.some((field) =>
        key.toLowerCase().includes(field.toLowerCase())
      );

      return [
        key,
        isSensitive ? "[REDACTED]" : redactSensitiveData(nestedValue, depth + 1)
      ];
    })
  );
};

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const started = Date.now();
  req.requestId = uuidv4();

  res.on("finish", () => {
    const payload = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: req.user?.sub,
      body: redactSensitiveData(req.body),
      query: redactSensitiveData(req.query)
    };

    const serialized = JSON.stringify(payload);
    if (res.statusCode >= 400) {
      logger.error(serialized);
      return;
    }

    logger.info(serialized);
  });

  next();
};
