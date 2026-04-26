import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api, { authPath } from "../../../lib/api";
import {
  clearAccessToken,
  getAccessToken,
  getMemoryUser,
  setAccessToken,
  setMemoryUser
} from "../token";

export type AuthUser = {
  id: number | string;
  name?: string;
  username?: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthSession: (user: AuthUser, token?: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getMemoryUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existingToken = getAccessToken();
    const existingUser = getMemoryUser();

    // This flow keeps JWTs in memory only, so the best silent restore available
    // on mount is rehydrating the in-memory session while the tab stays alive.
    if (existingUser && (existingToken || existingUser.username)) {
      setUser(existingUser);
    } else {
      clearAccessToken();
      setMemoryUser(null);
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  const setAuthSession = (nextUser: AuthUser, token?: string) => {
    setAccessToken(token ?? "");
    setMemoryUser(nextUser);
    setUser(nextUser);
  };

  const logout = async () => {
    try {
      await api.post(authPath("/auth/logout"));
    } finally {
      clearAccessToken();
      setMemoryUser(null);
      setUser(null);
      window.location.assign("/login");
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      setAuthSession,
      logout
    }),
    [isLoading, user]
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
