import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/api";
import { useAuth, type AuthUser } from "../context/AuthContext";
import type { LoginFormValues } from "../validation/authSchemas";

type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuthSession } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>("/api/auth/login", values);
      setAuthSession(response.data.user, response.data.accessToken);
      navigate("/dashboard");
    } catch (requestError) {
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};
