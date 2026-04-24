import bcrypt from "bcryptjs";
import axios from "axios";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database";
import { emailTransport } from "../../config/email";
import { env } from "../../config/env";
import { redis } from "../../config/redis";
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
  passwordResetEmail,
  verificationEmail,
  welcomeEmail
} from "../../utils/email.templates";
import { signJwt, verifyJwt } from "../../utils/jwt.utils";

type SessionMeta = {
  ipAddress?: string;
  userAgent?: string;
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
};

const decimalToNumber = (value: Prisma.Decimal | number) =>
  typeof value === "number" ? value : Number(value);

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

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!env.SMTP_HOST) {
    return;
  }

  await emailTransport.sendMail({
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
    to,
    subject,
    html
  });
};

const createSessionTokens = async (
  user: {
    id: string;
    email: string;
    username: string;
    role: "CUSTOMER" | "ADMIN" | "SUPERADMIN";
  },
  meta: SessionMeta
) => {
  const access = signJwt(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    "access"
  );

  const refresh = signJwt(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      sessionId: crypto.randomUUID()
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
      expiresAt: new Date(Date.now() + refreshCookieOptions.maxAge)
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
  await redis.setEx(`nexus:email-verify:${tokenHash}`, 24 * 60 * 60, userId);
  return token;
};

const createPasswordResetToken = async (userId: string) => {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  await redis.setEx(`nexus:password-reset:${tokenHash}`, 60 * 60, userId);
  return token;
};

const getTwoFactorSecret = (value: string | null) => {
  if (!value) {
    return null;
  }

  const parsed = JSON.parse(value) as { encrypted: string; iv: string; tag: string };
  return decryptKey(parsed.encrypted, parsed.iv, parsed.tag);
};

export const authService = {
  async register(input: { email: string; username: string; password: string }, meta: SessionMeta) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }]
      }
    });

    if (existingUser) {
      throw new Error("Email or username already in use.");
    }

    const isPwned = await checkPwnedPassword(input.password);
    if (isPwned) {
      throw new Error("Password has appeared in a known breach. Choose a safer one.");
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        profile: {
          create: {}
        },
        cart: {
          create: {}
        }
      }
    });

    const verificationToken = await createVerificationToken(user.id);
    const verificationUrl = `${env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(
      user.email,
      "Welcome to NEXUS",
      welcomeEmail(user.username, verificationUrl)
    );

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
    const lockKey = `nexus:account-lock:${input.email.toLowerCase()}`;
    const isLocked = await redis.get(lockKey);

    if (isLocked) {
      throw new Error("Account temporarily locked due to repeated failed logins.");
    }

    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() }
    });

    if (!user?.passwordHash) {
      throw new Error("Invalid email or password.");
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!validPassword) {
      const attemptsKey = `nexus:login-attempts:${input.email.toLowerCase()}`;
      const attempts = await redis.incr(attemptsKey);
      if (attempts === 1) {
        await redis.expire(attemptsKey, 15 * 60);
      }

      if (attempts >= 5) {
        await redis.setEx(lockKey, 15 * 60, "1");
      }

      throw new Error("Invalid email or password.");
    }

    if (user.isBanned) {
      throw new Error(user.banReason || "This account has been suspended.");
    }

    if (!user.isEmailVerified) {
      const verificationToken = await createVerificationToken(user.id);
      const verificationUrl = `${env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail(
        user.email,
        "Verify your NEXUS email",
        verificationEmail(user.username, verificationUrl)
      );
      throw new Error("Email not verified. A new verification email has been sent.");
    }

    if (user.twoFactorEnabled) {
      const secret = getTwoFactorSecret(user.twoFactorSecret);

      if (!secret || !input.twoFactorCode || !verifyTOTP(input.twoFactorCode, secret)) {
        await redis.setEx(`nexus:2fa-pending:${user.id}`, 300, "1");
        throw new Error("Two-factor authentication code required.");
      }
    }

    await redis.del(`nexus:login-attempts:${input.email.toLowerCase()}`);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const tokens = await createSessionTokens(user, meta);

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
        data: { isRevoked: true }
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
        data: { isRevoked: true }
      });
      throw new Error("Refresh session is invalid.");
    }

    await prisma.userSession.update({
      where: { id: session.id },
      data: { isRevoked: true }
    });

    const tokens = await createSessionTokens(session.user, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    return {
      user: serializeUser(session.user),
      ...tokens
    };
  },

  async verifyEmail(token: string) {
    const tokenHash = hashToken(token);
    const userId = await redis.get(`nexus:email-verify:${tokenHash}`);

    if (!userId) {
      throw new Error("Verification token is invalid or expired.");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true }
    });

    await redis.del(`nexus:email-verify:${tokenHash}`);
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return;
    }

    const resetToken = await createPasswordResetToken(user.id);
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Reset your NEXUS password",
      passwordResetEmail(user.username, resetUrl, "1 hour")
    );
  },

  async resetPassword(input: { token: string; password: string }) {
    const tokenHash = hashToken(input.token);
    const userId = await redis.get(`nexus:password-reset:${tokenHash}`);

    if (!userId) {
      throw new Error("Reset token is invalid or expired.");
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash, twoFactorEnabled: false, twoFactorSecret: null }
      }),
      prisma.userSession.updateMany({
        where: { userId },
        data: { isRevoked: true }
      })
    ]);

    await redis.del(`nexus:password-reset:${tokenHash}`);
  },

  async setupTwoFactor(userId: string) {
    const secret = generateTOTPSecret();
    const otpauthUrl = `otpauth://totp/NEXUS:${userId}?secret=${secret}&issuer=NEXUS`;
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    const backupCodes = generateBackupCodes();

    await redis.setEx(
      `nexus:2fa:setup:${userId}`,
      300,
      JSON.stringify({ secret, backupCodes })
    );

    return {
      secret,
      qrCodeUrl,
      backupCodes
    };
  },

  async verifyTwoFactor(userId: string, token: string) {
    const pending = await redis.get(`nexus:2fa:setup:${userId}`);

    if (!pending) {
      throw new Error("No pending 2FA setup found.");
    }

    const { secret, backupCodes } = JSON.parse(pending) as {
      secret: string;
      backupCodes: string[];
    };

    if (!verifyTOTP(token, secret)) {
      throw new Error("Invalid authentication code.");
    }

    const encrypted = encryptKey(secret);

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: JSON.stringify(encrypted)
      }
    });

    await redis.del(`nexus:2fa:setup:${userId}`);

    return { backupCodes };
  },

  async disableTwoFactor(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.passwordHash) {
      throw new Error("Password confirmation failed.");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error("Password confirmation failed.");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });
  },

  attachRefreshCookie(res: Response, refreshToken: string) {
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  },

  clearRefreshCookie(res: Response) {
    res.clearCookie("refreshToken", refreshCookieOptions);
  },

  async sendOrderReceipt(email: string, orderNumber: string) {
    await sendEmail(email, `Order ${orderNumber} confirmed`, orderConfirmationEmail(orderNumber));
  }
};
