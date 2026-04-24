import crypto from "node:crypto";
import speakeasy from "speakeasy";
import { env } from "../config/env";

const encryptionKey = Buffer.from(env.AES_ENCRYPTION_KEY, "hex");

export const encryptKey = (plaintext: string) => {
  const iv = crypto.randomBytes(env.AES_IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64")
  };
};

export const decryptKey = (encrypted: string, iv: string, tag: string) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
};

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateSecureToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const timingSafeCompare = (a: string, b: string) => {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  if (first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
};

export const generateTOTPSecret = () =>
  speakeasy.generateSecret({
    length: 32,
    name: "NEXUS"
  }).base32;

export const verifyTOTP = (token: string, secret: string) =>
  speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1
  });

export const generateBackupCodes = (count = 8) =>
  Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );

