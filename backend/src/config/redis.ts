import { createClient } from "redis";
import { env } from "./env";
import { logger } from "./logger";

const globalForRedis = globalThis as unknown as {
  redis?: ReturnType<typeof createClient>;
};

export const redis =
  globalForRedis.redis ??
  createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
    }
  });

redis.on("error", (error) => {
  logger.error(`Redis error: ${error.message}`);
});

redis.on("reconnecting", () => {
  logger.warn("Redis reconnecting");
});

if (!redis.isOpen) {
  void redis.connect().catch((error) => {
    logger.error(`Redis connection failed: ${error instanceof Error ? error.message : "unknown error"}`);
  });
}

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export const isRedisReady = () => redis.isReady;

export const safeRedisGet = async (key: string) => {
  if (!redis.isReady) {
    return null;
  }

  try {
    return await redis.get(key);
  } catch (error) {
    logger.warn(`Redis get skipped for ${key}: ${error instanceof Error ? error.message : "unknown error"}`);
    return null;
  }
};

export const safeRedisSetEx = async (key: string, ttlSeconds: number, value: string) => {
  if (!redis.isReady) {
    return false;
  }

  try {
    await redis.setEx(key, ttlSeconds, value);
    return true;
  } catch (error) {
    logger.warn(`Redis setEx skipped for ${key}: ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }
};

export const safeRedisDel = async (...keys: string[]) => {
  if (!redis.isReady || keys.length === 0) {
    return 0;
  }

  try {
    return await redis.del(keys);
  } catch (error) {
    logger.warn(`Redis del skipped for ${keys.join(",")}: ${error instanceof Error ? error.message : "unknown error"}`);
    return 0;
  }
};
