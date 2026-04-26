import { z } from "zod";
import { translate, type TranslationKey } from "../../../i18n/translations";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/;

type TranslateFn = (key: TranslationKey) => string;

const defaultT: TranslateFn = (key) => translate("en", key);

export const createLoginSchema = (t: TranslateFn = defaultT) =>
  z.object({
    email: z.string().min(1, t("auth.validation.emailRequired")).email(t("auth.validation.emailInvalid")),
    password: z.string().min(8, t("auth.validation.passwordLength"))
  });

export const createSignUpSchema = (t: TranslateFn = defaultT) =>
  z
    .object({
      name: z
        .string()
        .min(3, t("auth.validation.nameLength"))
        .max(24, t("auth.validation.nameMax"))
        .regex(/^[a-zA-Z0-9_ ]+$/, t("auth.validation.nameChars")),
      email: z.string().min(1, t("auth.validation.emailRequired")).email(t("auth.validation.emailInvalid")),
      password: z.string().regex(strongPasswordRegex, t("auth.validation.passwordStrong")),
      confirmPassword: z.string().regex(strongPasswordRegex, t("auth.validation.passwordStrong"))
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordMatch"),
      path: ["confirmPassword"]
    });

export const loginSchema = createLoginSchema();
export const signUpSchema = createSignUpSchema();

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
