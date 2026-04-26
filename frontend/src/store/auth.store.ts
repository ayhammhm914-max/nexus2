import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ensureCsrfToken, getCsrfHeaders } from "../lib/csrf";
import { clearSentryUser, setSentryUser } from "../lib/sentry";
import type { User } from "../types/user.types";
import type { ApiResponse } from "../types/api.types";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: {
    email: string;
    password: string;
    twoFactorCode?: string;
  }) => Promise<{ requiresTwoFactor: boolean }>;
  register: (payload: { email: string; username: string; password: string }) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  logoutLocal: () => void;
  setSession: (user: User) => void;
};

let refreshTimer: number | null = null;

const scheduleRefresh = () => {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer);
  }

  refreshTimer = window.setTimeout(() => {
    void useAuthStore.getState().refreshToken();
  }, 14 * 60 * 1000);
};

const baseURL = import.meta.env.VITE_API_URL ?? "/api/v1";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      setSession: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        setSentryUser(user);
        scheduleRefresh();
      },
      updateUser: (user) => {
        set({ user });
        setSentryUser(user);
      },
      logoutLocal: () => {
        if (refreshTimer) {
          window.clearTimeout(refreshTimer);
        }
        clearSentryUser();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      },
      login: async (payload) => {
        set({ isLoading: true });
        try {
          await ensureCsrfToken();
          const response = await axios.post<ApiResponse<{ user?: User; requiresTwoFactor?: boolean }>>(
            `${baseURL}/auth/login`,
            payload,
            { withCredentials: true, headers: getCsrfHeaders() }
          );

          if (response.status === 202 || response.data.data.requiresTwoFactor) {
            set({ isLoading: false });
            return { requiresTwoFactor: true };
          }

          if (response.data.data.user) {
            get().setSession(response.data.data.user);
          }

          return { requiresTwoFactor: false };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      register: async (payload) => {
        set({ isLoading: true });
        try {
          await ensureCsrfToken();
          const response = await axios.post<ApiResponse<{ user: User }>>(
            `${baseURL}/auth/register`,
            payload,
            { withCredentials: true, headers: getCsrfHeaders() }
          );
          get().setSession(response.data.data.user);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      refreshToken: async () => {
        try {
          await ensureCsrfToken();
          const response = await axios.post<ApiResponse<{ user: User }>>(
            `${baseURL}/auth/refresh`,
            {},
            { withCredentials: true, headers: getCsrfHeaders() }
          );
          get().setSession(response.data.data.user);
          return true;
        } catch {
          get().logoutLocal();
          return false;
        }
      },
      logout: async () => {
        try {
          await ensureCsrfToken();
          await axios.post(
            `${baseURL}/auth/logout`,
            {},
            {
              withCredentials: true,
              headers: getCsrfHeaders()
            }
          );
        } finally {
          get().logoutLocal();
        }
      }
    }),
    {
      name: "nexus-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
