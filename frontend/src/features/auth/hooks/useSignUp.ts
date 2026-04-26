import { useState } from "react";
import api from "../../../lib/api";
import type { SignUpFormValues } from "../validation/authSchemas";

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/api/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password
      });
      setSuccess("Account created! Please log in.");
    } catch (requestError) {
      setError("Registration failed. The email may already be registered.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSignUp, isLoading, error, success };
};
