import jwt, { type SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import type { JwtUserPayload } from "../types/express";

type TokenType = "access" | "refresh";

type BaseUserPayload = Omit<JwtUserPayload, "jti" | "type">;

const getSigningConfig = (type: TokenType) =>
  type === "access"
    ? {
        privateKey: env.JWT_ACCESS_PRIVATE_KEY,
        publicKey: env.JWT_ACCESS_PUBLIC_KEY,
        expiresIn: env.JWT_ACCESS_EXPIRES
      }
    : {
        privateKey: env.JWT_REFRESH_PRIVATE_KEY,
        publicKey: env.JWT_REFRESH_PUBLIC_KEY,
        expiresIn: env.JWT_REFRESH_EXPIRES
      };

export const signJwt = (payload: BaseUserPayload, type: TokenType) => {
  const config = getSigningConfig(type);
  const tokenPayload: JwtUserPayload = {
    ...payload,
    jti: uuidv4(),
    type
  };

  const token = jwt.sign(tokenPayload, config.privateKey, {
    algorithm: "RS256",
    expiresIn: config.expiresIn as SignOptions["expiresIn"],
    keyid: env.JWT_KEY_ID,
    subject: payload.sub
  });

  return {
    token,
    payload: tokenPayload
  };
};

export const verifyJwt = (token: string, type: TokenType) => {
  const config = getSigningConfig(type);

  return jwt.verify(token, config.publicKey, {
    algorithms: ["RS256"]
  }) as JwtUserPayload;
};
