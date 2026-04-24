import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger";

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const started = Date.now();
  req.requestId = uuidv4();

  res.on("finish", () => {
    logger.info(
      JSON.stringify({
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - started,
        ip: req.ip
      })
    );
  });

  next();
};

