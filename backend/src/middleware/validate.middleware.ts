import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

type RequestSchema = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

const formatZodError = (error: ZodError) =>
  error.issues
    .map((issue) => {
      const field = issue.path.length ? issue.path.join(".") : "request";
      return `${field}: ${issue.message}`;
    })
    .join("; ");

export const validateRequest =
  (schema: RequestSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: formatZodError(error),
            details: error.flatten()
          }
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request payload."
        }
      });
    }
  };

export const validate = validateRequest;
