import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import passport from "passport";
import { prisma } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { redis } from "./config/redis";
import { initializeSentry, Sentry } from "./config/sentry";
import { corsMiddleware } from "./middleware/cors.middleware";
import { csrfMiddleware } from "./middleware/csrf.middleware";
import {
  errorHandlerMiddleware,
  notFoundMiddleware
} from "./middleware/errorHandler.middleware";
import { loggingMiddleware } from "./middleware/logging.middleware";
import { securityMiddleware } from "./middleware/security.middleware";
import { adminRoutes } from "./modules/admin/admin.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { configureOAuthStrategies } from "./modules/auth/oauth.strategy";
import { cartRoutes } from "./modules/cart/cart.routes";
import { ordersRoutes } from "./modules/orders/orders.routes";
import { paymentsRoutes } from "./modules/payments/payments.routes";
import {
  adminProductsRoutes,
  productsRoutes
} from "./modules/products/products.routes";
import { searchRoutes } from "./modules/search/search.routes";
import { securityRoutes } from "./modules/security/security.routes";
import { uploadsRoutes } from "./modules/uploads/uploads.routes";
import { cleanExpiredSessionsJob } from "./jobs/cleanExpiredSessions.job";
import { saleEndNotificationJob } from "./jobs/saleEndNotification.job";
import { stockAlertJob } from "./jobs/stockAlert.job";

initializeSentry();

configureOAuthStrategies();

const app = express();
const resolveWellKnownDirectory = () => {
  const candidates = [
    path.resolve(process.cwd(), "public", ".well-known"),
    path.resolve(process.cwd(), "backend", "public", ".well-known"),
    path.resolve(__dirname, "../public/.well-known")
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
};

if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

if (env.NODE_ENV === "production" && env.FORCE_HTTPS) {
  app.use((req, res, next) => {
    const forwardedProto = req.get("x-forwarded-proto");
    if (req.secure || forwardedProto === "https") {
      return next();
    }

    return res.redirect(301, `https://${req.get("host")}${req.originalUrl}`);
  });
}

app.use(loggingMiddleware);
app.use(corsMiddleware);
app.use(cookieParser());
app.use(passport.initialize());

app.get("/api/v1/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  const redisStatus = redis.isReady ? "ready" : "not-ready";
  res.json({
    success: true,
    data: {
      status: "ok",
      redis: redisStatus
    }
  });
});

app.use(`/api/${env.API_VERSION}/payments`, paymentsRoutes);
app.use(securityMiddleware);
app.use(csrfMiddleware);
app.use("/.well-known", express.static(resolveWellKnownDirectory()));

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}`, securityRoutes);
app.use(`/api/${env.API_VERSION}/admin`, adminRoutes);
app.use(`/api/${env.API_VERSION}/products`, productsRoutes);
app.use(`/api/${env.API_VERSION}/admin/products`, adminProductsRoutes);
app.use(`/api/${env.API_VERSION}/cart`, cartRoutes);
app.use(`/api/${env.API_VERSION}/orders`, ordersRoutes);
app.use(`/api/${env.API_VERSION}/search`, searchRoutes);
app.use(`/api/${env.API_VERSION}/uploads`, uploadsRoutes);

if (env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const server = app.listen(env.PORT, () => {
  logger.info(`NEXUS backend running on port ${env.PORT}`);
});

cleanExpiredSessionsJob();
saleEndNotificationJob();
stockAlertJob();

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    if (redis.isOpen) {
      await redis.quit();
    }
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (error) => {
  logger.error(`Unhandled rejection: ${error instanceof Error ? error.message : String(error)}`);
  Sentry.captureException(error);
});
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  Sentry.captureException(error);
});
