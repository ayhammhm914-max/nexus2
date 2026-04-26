import { useState } from "react";
import api, { authPath, getApiErrorMessage, usesVersionedAuthApi } from "../../../lib/api";
import type { SignUpFormValues } from "../validation/authSchemas";

const toUsername = (name: string, email: string) => {
  const fromName = name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 24);

  if (fromName.length >= 3) {
    return fromName;
  }

  const fromEmail = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  return fromEmail.length >= 3 ? fromEmail : `user_${Date.now().toString(36)}`.slice(0, 24);
};

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = usesVersionedAuthApi
        ? {
            email: values.email,
            username: toUsername(values.name, values.email),
            password: values.password
          }
        : {
            name: values.name,
            email: values.email,
            password: values.password
          };

      await api.post(authPath("/auth/register"), payload);
      setSuccess("Account created! Please log in.");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Registration failed. Please check the account details and try again."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSignUp, isLoading, error, success };
};
