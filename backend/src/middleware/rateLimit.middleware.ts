import rateLimit, { type Options } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { isRedisReady, redis } from "../config/redis";
import { logger } from "../config/logger";

const createStore = () =>
  isRedisReady()
    ? new RedisStore({
        sendCommand: (...args: string[]) => redis.sendCommand(args)
      })
    : undefined;

export const createRateLimiter = (options: Partial<Options>) => {
  const store = createStore();

  return rateLimit({
    ...(store ? { store } : {}),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${req.ip} on ${req.originalUrl}`);
      res.setHeader("Retry-After", String(Math.ceil((options.windowMs ?? 60000) / 1000)));
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please try again later."
        }
      });
    },
    skip: (req) => req.user?.role === "ADMIN" || req.user?.role === "SUPERADMIN",
    ...options
  });
};

export const rateLimiters = {
  public: createRateLimiter({ windowMs: 60_000, limit: 200 }),
  search: createRateLimiter({ windowMs: 60_000, limit: 60 }),
  login: createRateLimiter({ windowMs: 15 * 60_000, limit: 10 }),
  register: createRateLimiter({ windowMs: 60 * 60_000, limit: 5 }),
  forgotPassword: createRateLimiter({ windowMs: 60 * 60_000, limit: 3 }),
  refresh: createRateLimiter({ windowMs: 60_000, limit: 30 }),
  payment: createRateLimiter({ windowMs: 60_000, limit: 5 }),
  checkout: createRateLimiter({ windowMs: 60_000, limit: 10 }),
  upload: createRateLimiter({ windowMs: 60 * 60_000, limit: 50 }),
  admin: createRateLimiter({ windowMs: 60_000, limit: 100 }),
  apiKey: createRateLimiter({ windowMs: 24 * 60 * 60_000, limit: 5 }),
  webhook: createRateLimiter({ windowMs: 60_000, limit: 1000 }),
  authenticated: createRateLimiter({ windowMs: 60_000, limit: 500 })
};
