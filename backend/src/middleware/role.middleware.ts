import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/response.utils";

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(errorResponse("UNAUTHORIZED", "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse("FORBIDDEN", "Insufficient permissions."));
    }

    next();
  };

