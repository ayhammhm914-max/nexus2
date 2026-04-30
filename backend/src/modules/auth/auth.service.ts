import bcrypt from "bcryptjs";
import axios from "axios";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database";
import { emailTransport } from "../../config/email";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { redis } from "../../config/redis";
import {
  clearTokenCookies,
  refreshTokenCookieOptions,
  setRefreshTokenCookie
} from "../../middleware/auth-cookie.middleware";
import {
  decryptKey,
  encryptKey,
  generateBackupCodes,
  generateSecureToken,
  generateTOTPSecret,
  hashToken,
  verifyTOTP
} from "../../utils/crypto.utils";
import {
  orderConfirmationEmail,
  passwordChangedEmail,
  passwordResetEmail,
  verificationEmail,
  welcomeEmail
} from "../../utils/email.templates";
import { signJwt, verifyJwt } from "../../utils/jwt.utils";

type SessionMeta = {
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
};

const decimalToNumber = (value: Prisma.Decimal | number) =>
  typeof value === "number" ? value : Number(value);

const BCRYPT_ROUNDS = Math.max(env.BCRYPT_ROUNDS, 12);
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/;

const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
  } catch {
    throw new Error("Unable to secure password at this time.");
  }
};

const verifyPassword = async (plainPassword: string, hashedPassword: string) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch {
    return false;
  }
};

const parseDeviceName = (userAgent?: string) => {
  const normalizedAgent = (userAgent ?? "").toLowerCase();

  const browser =
    normalizedAgent.includes("edg/")
      ? "Edge"
      : normalizedAgent.includes("chrome/")
        ? "Chrome"
        : normalizedAgent.includes("firefox/")
          ? "Firefox"
          : normalizedAgent.includes("safari/") && !normalizedAgent.includes("chrome/")
            ? "Safari"
            : normalizedAgent.includes("opr/")
              ? "Opera"
              : "Unknown Browser";

  const operatingSystem =
    normalizedAgent.includes("windows")
      ? "Windows"
      : normalizedAgent.includes("android")
        ? "Android"
        : normalizedAgent.includes("iphone") || normalizedAgent.includes("ipad")
          ? "iOS"
          : normalizedAgent.includes("mac os")
            ? "macOS"
            : normalizedAgent.includes("linux")
              ? "Linux"
              : "Unknown OS";

  return `${browser} on ${operatingSystem}`;
};

const serializeUser = (user: {
  id: string;
  email: string;
  username: string;
  role: "CUSTOMER" | "ADMIN" | "SUPERADMIN";
  isEmailVerified: boolean;
  avatarUrl: string | null;
  loyaltyPoints: number;
  balance: Prisma.Decimal | number;
}) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  avatarUrl: user.avatarUrl,
  loyaltyPoints: user.loyaltyPoints,
  balance: decimalToNumber(user.balance)
});

const isEmailDeliveryConfigured = () =>
  Boolean(
    env.SMTP_HOST &&
      env.SMTP_USER &&
      env.SMTP_PASS &&
      !["replace_me", "changeme", ""].includes(env.SMTP_PASS.trim())
  );

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!isEmailDeliveryConfigured()) {
    return;
  }

  try {
    await emailTransport.sendMail({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    logger.warn(
      `Email delivery skipped after provider failure: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

const recordLoginAttempt = async (
  email: string,
  success: boolean,
  meta: SessionMeta,
  userId?: string
) => {
  await prisma.loginAttempt.create({
    data: {
      email,
      success,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      userId
    }
  });
};

const encryptJsonValue = (value: unknown) => JSON.stringify(encryptKey(JSON.stringify(value)));

const createSessionTokens = async (
  user: {
    id: string;
    email: string;
    username: string;
    role: "CUSTOMER" | "ADMIN" | "SUPERADMIN";
  },
  meta: SessionMeta
) => {
  const sessionId = crypto.randomUUID();

  const access = signJwt(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      sessionId
    },
    "access"
  );

  const refresh = signJwt(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      sessionId
    },
    "refresh"
  );

  const refreshTokenHash = hashToken(refresh.token);

  await prisma.userSession.create({
    data: {
      id: refresh.payload.sessionId,
      userId: user.id,
      refreshTokenHash,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      deviceName: meta.deviceName ?? parseDeviceName(meta.userAgent),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + (refreshTokenCookieOptions.maxAge ?? 7 * 24 * 60 * 60 * 1000))
    }
  });

  await redis.setEx(
    `nexus:session:${user.id}:${refresh.payload.sessionId}`,
    7 * 24 * 60 * 60,
    JSON.stringify(meta)
  );

  return {
    accessToken: access.token,
    accessPayload: access.payload,
    refreshToken: refresh.token
  };
};

const checkPwnedPassword = async (password: string) => {
  try {
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    const response = await axios.get<string>(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        timeout: 3000
      }
    );

    return response.data.split("\r\n").some((line) => line.startsWith(suffix));
  } catch {
    return false;
  }
};

const createVerificationToken = async (userId: string) => {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  await prisma.emailVerificationToken.deleteMany({
    where: { userId }
  });
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
  return token;
};

const createPasswordResetToken = async (userId: string) => {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  });
  return token;
};

const getTwoFactorSecret = (value: string | null) => {
  if (!value) {
    return null;
  }

  const parsed = JSON.parse(value) as { encrypted: string; iv: string; tag: string };
  return decryptKey(parsed.encrypted, parsed.iv, parsed.tag);
};

const getTwoFactorBackupCodes = (value: string | null) => {
  if (!value) {
    return [] as Array<{ code: string; used: boolean }>;
  }

  const parsed = JSON.parse(value) as { encrypted: string; iv: string; tag: string };
  return JSON.parse(decryptKey(parsed.encrypted, parsed.iv, parsed.tag)) as Array<{
    code: string;
    used: boolean;
  }>;
};

const verifyStoredTwoFactorCode = async (
  user: {
    id: string;
    twoFactorSecret: string | null;
    twoFactorBackupCodes?: string | null;
  },
  code: string
) => {
  const secret = getTwoFactorSecret(user.twoFactorSecret);
  if (secret && verifyTOTP(code, secret)) {
    return true;
  }

  const backupCodes = getTwoFactorBackupCodes(user.twoFactorBackupCodes ?? null);
  const normalizedCode = code.trim().toUpperCase();
  const matchedBackupCode = backupCodes.find(
    (backupCode) => backupCode.code === normalizedCode && !backupCode.used
  );

  if (!matchedBackupCode) {
    return false;
  }

  const updatedBackupCodes = backupCodes.map((backupCode) =>
    backupCode.code === normalizedCode ? { ...backupCode, used: true } : backupCode
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorBackupCodes: encryptJsonValue(updatedBackupCodes)
    }
  });

  return true;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeUsername = (value: string) => {
  const normalized = value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 24);

  return normalized.length >= 3 ? normalized : `user_${crypto.randomBytes(4).toString("hex")}`;
};

const buildUsernameCandidates = (email: string, displayName?: string) => {
  const localPart = email.split("@")[0] ?? "user";
  return [
    displayName ? normalizeUsername(displayName) : "",
    normalizeUsername(localPart),
    `user_${crypto.randomBytes(5).toString("hex")}`
  ].filter(Boolean);
};

const getUniqueUsername = async (email: string, displayName?: string) => {
  for (const candidate of buildUsernameCandidates(email, displayName)) {
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) {
      return candidate;
    }
  }

  return `user_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
};

type OAuthProfile = {
  provider: string;
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
};

export const authService = {
  async register(input: { email: string; username: string; password: string }, meta: SessionMeta) {
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedUsername = normalizeUsername(input.username);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }]
      }
    });

    if (existingUser) {
      throw new Error("Email or username already in use.");
    }

    const isPwned = await checkPwnedPassword(input.password);
    if (isPwned) {
      throw new Error("Password has appeared in a known breach. Choose a safer one.");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        isEmailVerified: !isEmailDeliveryConfigured(),
        profile: {
          create: {}
        },
        cart: {
          create: {}
        }
      }
    });

    if (isEmailDeliveryConfigured()) {
      const verificationToken = await createVerificationToken(user.id);
      const verificationUrl = `${env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail(
        user.email,
        "Welcome to NEXUS",
        welcomeEmail(user.username, verificationUrl)
      );
    }

    const tokens = await createSessionTokens(user, meta);

    return {
      user: serializeUser({
        ...user,
        balance: user.balance,
        avatarUrl: user.avatarUrl
      }),
      ...tokens
    };
  },

  async login(
    input: { email: string; password: string; twoFactorCode?: string },
    meta: SessionMeta
  ) {
    const normalizedEmail = input.email.toLowerCase();
    const lockKey = `nexus:account-lock:${normalizedEmail}`;
    const isLocked = await redis.get(lockKey);

    if (isLocked) {
      await recordLoginAttempt(normalizedEmail, false, meta);
      throw new Error("Account temporarily locked due to repeated failed logins.");
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user?.passwordHash) {
      await recordLoginAttempt(normalizedEmail, false, meta);
      throw new Error("Invalid email or password.");
    }

    const validPassword = await verifyPassword(input.password, user.passwordHash);

    if (!validPassword) {
      const attemptsKey = `nexus:login-attempts:${normalizedEmail}`;
      const attempts = await redis.incr(attemptsKey);
      if (attempts === 1) {
        await redis.expire(attemptsKey, 15 * 60);
      }

      if (attempts >= 5) {
        await redis.setEx(lockKey, 15 * 60, "1");
      }

      await recordLoginAttempt(normalizedEmail, false, meta, user.id);
      throw new Error("Invalid email or password.");
    }

    if (user.isBanned) {
      await recordLoginAttempt(normalizedEmail, false, meta, user.id);
      throw new Error(user.banReason || "This account has been suspended.");
    }

    if (!user.isEmailVerified && isEmailDeliveryConfigured()) {
      const verificationToken = await createVerificationToken(user.id);
      const verificationUrl = `${env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail(
        user.email,
        "Verify your NEXUS email",
        verificationEmail(user.username, verificationUrl)
      );
      await recordLoginAttempt(normalizedEmail, false, meta, user.id);
      throw new Error("Email not verified. A new verification email has been sent.");
    }

    if (!user.isEmailVerified && !isEmailDeliveryConfigured()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true }
      });
      user.isEmailVerified = true;
    }

    if (user.twoFactorEnabled) {
      if (!input.twoFactorCode) {
        await redis.setEx(`nexus:2fa-pending:${user.id}`, 300, "1");
        return {
          requiresTwoFactor: true as const
        };
      }

      const twoFactorValid = await verifyStoredTwoFactorCode(user, input.twoFactorCode);
      if (!twoFactorValid) {
        await recordLoginAttempt(normalizedEmail, false, meta, user.id);
        throw new Error("Invalid two-factor authentication code.");
      }
    }

    await redis.del(`nexus:login-attempts:${normalizedEmail}`);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const tokens = await createSessionTokens(user, meta);
    await recordLoginAttempt(normalizedEmail, true, meta, user.id);

    return {
      user: serializeUser(user),
      ...tokens
    };
  },

  async logout(req: Request) {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken);
      await prisma.userSession.updateMany({
        where: { refreshTokenHash },
        data: { isRevoked: true, revokedAt: new Date() }
      });
    }

    if (req.user?.sessionId) {
      await prisma.userSession.updateMany({
        where: { id: req.user.sessionId },
        data: { isRevoked: true, revokedAt: new Date() }
      });
    }

    if (req.user?.jti) {
      await redis.setEx(`nexus:token:blacklist:${req.user.jti}`, 15 * 60, "1");
    }
  },

  async refresh(req: Request) {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new Error("Missing refresh token.");
    }

    const payload = verifyJwt(refreshToken, "refresh");
    const refreshTokenHash = hashToken(refreshToken);

    const session = await prisma.userSession.findUnique({
      where: { refreshTokenHash },
      include: { user: true }
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      await prisma.userSession.updateMany({
        where: { userId: payload.sub },
        data: { isRevoked: true, revokedAt: new Date() }
      });
      throw new Error("Refresh session is invalid.");
    }

    await prisma.userSession.update({
      where: { id: session.id },
      data: { isRevoked: true, revokedAt: new Date() }
    });

    const tokens = await createSessionTokens(session.user, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      deviceName: session.deviceName ?? parseDeviceName(req.get("user-agent"))
    });

    return {
      user: serializeUser(session.user),
      ...tokens
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isActive || user.isBanned) {
      throw new Error("User session is no longer valid.");
    }

    return serializeUser(user);
  },

  async loginWithOAuth(profile: OAuthProfile, meta: SessionMeta) {
    const normalizedEmail = normalizeEmail(profile.email);

    const result = await prisma.$transaction(async (tx) => {
      const linkedAccount = await tx.oAuthAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: profile.provider,
            providerUserId: profile.providerUserId
          }
        },
        include: { user: true }
      });

      if (linkedAccount) {
        const user = await tx.user.update({
          where: { id: linkedAccount.userId },
          data: {
            lastLoginAt: new Date(),
            avatarUrl: profile.avatarUrl ?? linkedAccount.user.avatarUrl
          }
        });

        await tx.oAuthAccount.update({
          where: { id: linkedAccount.id },
          data: {
            email: normalizedEmail,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl
          }
        });

        return user;
      }

      const existingUser = await tx.user.findUnique({
        where: { email: normalizedEmail }
      });

      const user =
        existingUser ??
        (await tx.user.create({
          data: {
            email: normalizedEmail,
            username: await getUniqueUsername(normalizedEmail, profile.displayName),
            passwordHash: null,
            isEmailVerified: profile.emailVerified,
            avatarUrl: profile.avatarUrl,
            profile: {
              create: {}
            },
            cart: {
              create: {}
            }
          }
        }));

      const updatedUser = existingUser
        ? await tx.user.update({
            where: { id: user.id },
            data: {
              isEmailVerified: profile.emailVerified ? true : user.isEmailVerified,
              avatarUrl: profile.avatarUrl ?? user.avatarUrl,
              lastLoginAt: new Date()
            }
          })
        : user;

      await tx.oAuthAccount.create({
        data: {
          userId: updatedUser.id,
          provider: profile.provider,
          providerUserId: profile.providerUserId,
          email: normalizedEmail,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl
        }
      });

      return updatedUser;
    });

    if (result.isBanned) {
      await recordLoginAttempt(normalizedEmail, false, meta, result.id);
      throw new Error(result.banReason || "This account has been suspended.");
    }

    const tokens = await createSessionTokens(result, meta);
    await recordLoginAttempt(normalizedEmail, true, meta, result.id);

    return {
      user: serializeUser(result),
      ...tokens
    };
  },

  async verifyEmail(token: string) {
    const tokenHash = hashToken(token);
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash }
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      if (verificationToken) {
        await prisma.emailVerificationToken.delete({
          where: { id: verificationToken.id }
        });
      }
      throw new Error("Verification token is invalid or expired.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { isEmailVerified: true }
      }),
      prisma.emailVerificationToken.deleteMany({
        where: { userId: verificationToken.userId }
      })
    ]);
  },

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase();
    const attemptsKey = `nexus:password-reset-attempts:${normalizedEmail}`;
    const attempts = await redis.incr(attemptsKey);

    if (attempts === 1) {
      await redis.expire(attemptsKey, 24 * 60 * 60);
    }

    if (attempts > 3) {
      throw new Error("Too many password reset attempts. Please try again tomorrow.");
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return;
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    const resetToken = await createPasswordResetToken(user.id);
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Reset your NEXUS password",
      passwordResetEmail(user.username, resetUrl, "1 hour")
    );
  },

  async resetPassword(input: { token: string; password: string }) {
    if (!passwordRegex.test(input.password)) {
      throw new Error(
        "Password must be 8-128 chars and include uppercase, lowercase, number and special character."
      );
    }

    const isPwned = await checkPwnedPassword(input.password);
    if (isPwned) {
      throw new Error("Password has appeared in a known breach. Choose a safer one.");
    }

    const tokenHash = hashToken(input.token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      if (resetToken) {
        await prisma.passwordResetToken.deleteMany({
          where: { id: resetToken.id }
        });
      }
      throw new Error("Reset token is invalid or expired.");
    }

    const passwordHash = await hashPassword(input.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null
        }
      }),
      prisma.userSession.updateMany({
        where: { userId: resetToken.userId },
        data: { isRevoked: true, revokedAt: new Date() }
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId }
      })
    ]);

    await sendEmail(
      resetToken.user.email,
      "Your NEXUS password was changed",
      passwordChangedEmail(resetToken.user.username)
    );
  },

  async setupTwoFactor(userId: string) {
    const secret = generateTOTPSecret();
    const otpauthUrl = `otpauth://totp/NEXUS:${userId}?secret=${secret}&issuer=NEXUS`;
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    await redis.setEx(
      `nexus:2fa:setup:${userId}`,
      300,
      JSON.stringify({ secret })
    );

    return {
      secret,
      qrCodeUrl
    };
  },

  async verifyTwoFactor(userId: string, token: string) {
    const pending = await redis.get(`nexus:2fa:setup:${userId}`);

    if (!pending) {
      throw new Error("No pending 2FA setup found.");
    }

    const { secret } = JSON.parse(pending) as {
      secret: string;
    };

    if (!verifyTOTP(token, secret)) {
      throw new Error("Invalid authentication code.");
    }

    const backupCodes = generateBackupCodes(10).map((code) => ({
      code,
      used: false
    }));
    const encrypted = encryptKey(secret);

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: JSON.stringify(encrypted),
        twoFactorBackupCodes: encryptJsonValue(backupCodes)
      }
    });

    await redis.del(`nexus:2fa:setup:${userId}`);
    return { backupCodes: backupCodes.map((backupCode) => backupCode.code) };
  },

  async disableTwoFactor(userId: string, password: string, token: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.passwordHash) {
      throw new Error("Password confirmation failed.");
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      throw new Error("Password confirmation failed.");
    }

    const validTwoFactorCode = await verifyStoredTwoFactorCode(user, token);
    if (!validTwoFactorCode) {
      throw new Error("Two-factor authentication code is invalid.");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      }
    });
  },

  async listAdminSessions(userId: string, currentSessionId?: string) {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: {
        lastActivity: "desc"
      }
    });

    return sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceName: session.deviceName,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      isCurrent: session.id === currentSessionId
    }));
  },

  async revokeAdminSession(userId: string, sessionId: string) {
    const session = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    });

    return { revokedSessionId: session.id };
  },

  async revokeAllOtherSessions(userId: string, currentSessionId?: string) {
    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        id: currentSessionId ? { not: currentSessionId } : undefined,
        isRevoked: false
      },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    });

    return { revokedCount: result.count };
  },

  attachRefreshCookie(res: Response, refreshToken: string) {
    setRefreshTokenCookie(res, refreshToken);
  },

  clearRefreshCookie(res: Response) {
    clearTokenCookies(res);
  },

  async sendOrderReceipt(email: string, orderNumber: string) {
    await sendEmail(email, `Order ${orderNumber} confirmed`, orderConfirmationEmail(orderNumber));
  }
};
