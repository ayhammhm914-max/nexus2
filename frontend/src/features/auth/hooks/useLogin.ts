import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { authPath, getApiErrorMessage } from "../../../lib/api";
import { useAuth, type AuthUser } from "../context/AuthContext";
import type { LoginFormValues } from "../validation/authSchemas";

type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

type VersionedLoginResponse = {
  success: boolean;
  data: {
    user: AuthUser;
  };
};

const normalizeAuthUser = (user: AuthUser): AuthUser => ({
  ...user,
  name: user.name ?? user.username ?? user.email.split("@")[0]
});

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuthSession } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse | VersionedLoginResponse>(
        authPath("/auth/login"),
        values
      );
      const responseData = response.data;
      const user = normalizeAuthUser(
        "data" in responseData ? responseData.data.user : responseData.user
      );
      const accessToken = "accessToken" in responseData ? responseData.accessToken : "";

      setAuthSession(user, accessToken);
      navigate("/dashboard");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Invalid email or password."));
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};
