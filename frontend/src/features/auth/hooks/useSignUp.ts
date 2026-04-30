import { useState } from "react";
import { getApiErrorMessage } from "../../../lib/api";
import { useTranslation } from "../../../store/language.store";
import { useAuth } from "../context/AuthContext";
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
  const { register } = useAuth();
  const { t } = useTranslation();

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await register({
        email: values.email,
        username: toUsername(values.name, values.email),
        password: values.password
      });
      setSuccess(t("auth.success.register"));
    } catch (authError) {
      setError(getApiErrorMessage(authError, t("auth.error.register")));
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSignUp, isLoading, error, success };
};

