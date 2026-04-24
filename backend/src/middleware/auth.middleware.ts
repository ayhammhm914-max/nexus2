import type { NextFunction, Request, Response } from "express";
import { redis } from "../config/redis";
import { verifyJwt } from "../utils/jwt.utils";
import { errorResponse } from "../utils/response.utils";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json(errorResponse("UNAUTHORIZED", "Missing bearer token."));
    }

    const token = authorization.replace("Bearer ", "").trim();
    const payload = verifyJwt(token, "access");
    const isBlacklisted = await redis.get(`nexus:token:blacklist:${payload.jti}`);

    if (isBlacklisted) {
      return res.status(401).json(errorResponse("TOKEN_REVOKED", "Session token has been revoked."));
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json(errorResponse("UNAUTHORIZED", "Invalid or expired token.", error));
  }
};

