import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { errorResponse } from "../utils/response.utils";

type RequestSchema = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validate =
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
        return res.status(422).json(
          errorResponse(
            "VALIDATION_ERROR",
            "Request validation failed.",
            error.flatten()
          )
        );
      }

      return res
        .status(422)
        .json(errorResponse("VALIDATION_ERROR", "Invalid request payload."));
    }
  };

