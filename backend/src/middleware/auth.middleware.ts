import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
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
    const cookieToken = req.cookies.accessToken as string | undefined;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.replace("Bearer ", "").trim()
      : undefined;
    const token = cookieToken ?? bearerToken;

    if (!token) {
      return res.status(401).json(errorResponse("UNAUTHORIZED", "Missing access token."));
    }

    const payload = verifyJwt(token, "access");
    const isBlacklisted = await redis.get(`nexus:token:blacklist:${payload.jti}`);

    if (isBlacklisted) {
      return res.status(401).json(errorResponse("TOKEN_REVOKED", "Session token has been revoked."));
    }

    if (payload.sessionId) {
      const session = await prisma.userSession.findUnique({
        where: { id: payload.sessionId }
      });

      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        return res.status(401).json(errorResponse("TOKEN_REVOKED", "Session has been revoked."));
      }

      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          lastActivity: new Date()
        }
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json(errorResponse("UNAUTHORIZED", "Invalid or expired token.", error));
  }
};
