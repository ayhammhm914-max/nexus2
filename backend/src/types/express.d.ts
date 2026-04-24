import type { UserRole } from "@prisma/client";

export interface JwtUserPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  sessionId?: string;
  jti: string;
  type: "access" | "refresh";
}

declare global {
  namespace Express {
    interface User extends JwtUserPayload {}

    interface Request {
      user?: JwtUserPayload;
      requestId?: string;
    }
  }
}

export {};

