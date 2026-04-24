import * as Sentry from "@sentry/node";
import type { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { env } from "../config/env";
import { errorResponse } from "../utils/response.utils";

export const notFoundMiddleware = (_req: Request, res: Response) => {
  res.status(404).json(errorResponse("NOT_FOUND", "Route not found."));
};

export const errorHandlerMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json(errorResponse("CONFLICT", "A unique field already exists.", error.meta));
    }

    if (error.code === "P2025") {
      return res
        .status(404)
        .json(errorResponse("NOT_FOUND", "Requested resource was not found."));
    }
  }

  if (error instanceof ZodError) {
    return res
      .status(422)
      .json(errorResponse("VALIDATION_ERROR", "Invalid request.", error.flatten()));
  }

  if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
    return res
      .status(401)
      .json(errorResponse("UNAUTHORIZED", "Invalid or expired token."));
  }

  logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  Sentry.captureException(error);

  return res.status(500).json(
    errorResponse(
      "INTERNAL_SERVER_ERROR",
      env.NODE_ENV === "production"
        ? "Something went wrong."
        : error instanceof Error
          ? error.message
          : "Unknown error."
    )
  );
};
