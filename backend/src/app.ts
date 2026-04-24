import "dotenv/config";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import express from "express";
import passport from "passport";
import { prisma } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { redis } from "./config/redis";
import { corsMiddleware } from "./middleware/cors.middleware";
import {
  errorHandlerMiddleware,
  notFoundMiddleware
} from "./middleware/errorHandler.middleware";
import { loggingMiddleware } from "./middleware/logging.middleware";
import { securityMiddleware } from "./middleware/security.middleware";
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
import { cleanExpiredSessionsJob } from "./jobs/cleanExpiredSessions.job";
import { saleEndNotificationJob } from "./jobs/saleEndNotification.job";
import { stockAlertJob } from "./jobs/stockAlert.job";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN
  });
}

configureOAuthStrategies();

const app = express();

if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
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

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/products`, productsRoutes);
app.use(`/api/${env.API_VERSION}/admin/products`, adminProductsRoutes);
app.use(`/api/${env.API_VERSION}/cart`, cartRoutes);
app.use(`/api/${env.API_VERSION}/orders`, ordersRoutes);
app.use(`/api/${env.API_VERSION}/search`, searchRoutes);

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

