import { z } from "zod";

const strongPasswordMessage =
  "Password must include uppercase, lowercase, number, and special character.";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/;

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters.")
      .max(24, "Name must be 24 characters or less.")
      .regex(/^[a-zA-Z0-9_ ]+$/, "Use only letters, numbers, spaces, and underscores."),
    email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
    password: z.string().regex(strongPasswordRegex, strongPasswordMessage),
    confirmPassword: z.string().regex(strongPasswordRegex, strongPasswordMessage)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
