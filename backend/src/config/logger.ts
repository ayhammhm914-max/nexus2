import winston from "winston";
import { env } from "./env";

const { combine, colorize, timestamp, printf, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}] ${stack ?? message}`;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  defaultMeta: { service: "nexus-backend" },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === "development" ? consoleFormat : combine(timestamp(), errors({ stack: true }), json())
    })
  ]
});

