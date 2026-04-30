import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../lib/api";
import { useTranslation } from "../../../store/language.store";
import { useAuth } from "../context/AuthContext";
import type { LoginFormValues } from "../validation/authSchemas";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(values);
      if (result.requiresTwoFactor) {
        setError(t("auth.error.twoFactorRequired"));
        return;
      }
      navigate("/dashboard");
    } catch (authError) {
      setError(getApiErrorMessage(authError, t("auth.error.login")));
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};

