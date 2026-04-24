import "dotenv/config";
import { z } from "zod";

const normalizeMultiline = (value: string) => value.replace(/\\n/g, "\n");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  API_VERSION: z.string().default("v1"),
  FRONTEND_URL: z.string().url(),
  APP_BASE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_PRIVATE_KEY: z.string().min(1),
  JWT_ACCESS_PUBLIC_KEY: z.string().min(1),
  JWT_REFRESH_PRIVATE_KEY: z.string().min(1),
  JWT_REFRESH_PUBLIC_KEY: z.string().min(1),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  JWT_KEY_ID: z.string().default("dev-v1"),
  AES_ENCRYPTION_KEY: z.string().length(64),
  AES_IV_LENGTH: z.coerce.number().default(16),
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_PUBLISHABLE_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_CALLBACK_URL: z.string().default(""),
  DISCORD_CLIENT_ID: z.string().default(""),
  DISCORD_CLIENT_SECRET: z.string().default(""),
  DISCORD_CALLBACK_URL: z.string().default(""),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  EMAIL_FROM: z.string().email(),
  EMAIL_FROM_NAME: z.string().default("NEXUS"),
  S3_BUCKET_NAME: z.string().default(""),
  S3_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  S3_ENDPOINT: z.string().optional().default(""),
  SENTRY_DSN: z.string().optional().default(""),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  MAX_CART_ITEMS: z.coerce.number().default(20),
  GUEST_CHECKOUT_ENABLED: z
    .string()
    .default("true")
    .transform((value) => value === "true"),
  LOYALTY_POINTS_RATE: z.coerce.number().default(10),
  TRUST_PROXY: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  CSRF_SECRET: z.string().min(1)
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  JWT_ACCESS_PRIVATE_KEY: normalizeMultiline(parsed.JWT_ACCESS_PRIVATE_KEY),
  JWT_ACCESS_PUBLIC_KEY: normalizeMultiline(parsed.JWT_ACCESS_PUBLIC_KEY),
  JWT_REFRESH_PRIVATE_KEY: normalizeMultiline(parsed.JWT_REFRESH_PRIVATE_KEY),
  JWT_REFRESH_PUBLIC_KEY: normalizeMultiline(parsed.JWT_REFRESH_PUBLIC_KEY)
};

