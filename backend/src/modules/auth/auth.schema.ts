import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/;

export const registerSchema = {
  body: z
    .object({
      email: z.string().email(),
      username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
      password: z.string().regex(passwordRegex, {
        message:
          "Password must be 8-128 chars and include uppercase, lowercase, number and special character."
      })
    })
    .strict()
};

export const loginSchema = {
  body: z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      twoFactorCode: z.string().length(6).optional()
    })
    .strict()
};

export const forgotPasswordSchema = {
  body: z
    .object({
      email: z.string().email()
    })
    .strict()
};

export const resetPasswordSchema = {
  body: z
    .object({
      token: z.string().min(32),
      password: z.string().regex(passwordRegex)
    })
    .strict()
};

export const verifyTokenSchema = {
  params: z
    .object({
      token: z.string().min(32)
    })
    .strict()
};

export const verifyTwoFactorSchema = {
  body: z
    .object({
      token: z.string().length(6)
    })
    .strict()
};

export const disableTwoFactorSchema = {
  body: z
    .object({
      password: z.string().min(8)
    })
    .strict()
};

