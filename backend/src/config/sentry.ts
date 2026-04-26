import * as Sentry from "@sentry/node";
import type { Request } from "express";
import { env } from "./env";

let sentryInitialized = false;

const redactHeaders = (headers: Request["headers"]) =>
  Object.fromEntries(
    Object.entries(headers).map(([key, value]) => {
      const sensitive = ["authorization", "cookie", "set-cookie", "x-csrf-token"].includes(
        key.toLowerCase()
      );

      return [key, sensitive ? "[REDACTED]" : value];
    })
  );

export const initializeSentry = () => {
  if (sentryInitialized || !env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 1.0,
    integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()]
  });

  sentryInitialized = true;
};

export const captureServerException = (error: unknown, req?: Request) => {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.withScope((scope) => {
    if (req?.user) {
      scope.setUser({
        id: req.user.sub,
        email: req.user.email,
        username: req.user.username
      });
    }

    if (req) {
      scope.setContext("request", {
        url: req.originalUrl,
        method: req.method,
        headers: redactHeaders(req.headers),
        ip: req.ip
      });
    }

    Sentry.captureException(error);
  });
};

export { Sentry };
