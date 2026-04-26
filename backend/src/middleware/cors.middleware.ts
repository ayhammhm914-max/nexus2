import cors from "cors";
import { env } from "../config/env";
import { logger } from "../config/logger";

const trustedOrigins = [
  env.FRONTEND_URL,
  env.STAGING_URL,
  env.PREVIEW_URL
].filter((origin): origin is string => Boolean(origin));

export const corsMiddleware = cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) {
      callback(null, true);
      return;
    }

    if (trustedOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }

    logger.warn(
      JSON.stringify({
        event: "CORS_BLOCKED",
        origin: requestOrigin,
        allowedOrigins: trustedOrigins
      })
    );
    callback(new Error("CORS origin not allowed."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  maxAge: 86_400
});
