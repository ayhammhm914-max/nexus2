import * as Sentry from "@sentry/react";
import type { User } from "../types/user.types";

let initialized = false;

export const initializeSentry = () => {
  if (initialized || !import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0
  });

  initialized = true;
};

export const setSentryUser = (user: User) => {
  if (!initialized) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username
  });
};

export const clearSentryUser = () => {
  if (!initialized) {
    return;
  }

  Sentry.setUser(null);
};

export const trackPageView = (path: string) => {
  if (!initialized) {
    return;
  }

  Sentry.addBreadcrumb({
    category: "navigation",
    message: path,
    level: "info"
  });
};
