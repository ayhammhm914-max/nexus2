import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuthStore } from "../../../store/auth.store";
import type { User } from "../../../types/user.types";

export type AuthUser = User & {
  name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: { email: string; password: string; twoFactorCode?: string }) => Promise<{ requiresTwoFactor: boolean }>;
  register: (payload: { email: string; username: string; password: string }) => Promise<void>;
  setAuthSession: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeUser = (user: User | null): AuthUser | null =>
  user
    ? {
        ...user,
        name: user.username || user.email.split("@")[0]
      }
    : null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    register,
    updateUser
  } = useAuthStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    void refreshToken().finally(() => setIsBootstrapping(false));
  }, [refreshToken]);

  const value = useMemo(
    () => ({
      user: normalizeUser(user),
      isAuthenticated,
      isLoading: isLoading || isBootstrapping,
      login,
      register,
      setAuthSession: updateUser,
      logout
    }),
    [isAuthenticated, isBootstrapping, isLoading, login, logout, register, updateUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};

