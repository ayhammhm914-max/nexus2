import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user.types";
import type { ApiResponse } from "../types/api.types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string; twoFactorCode?: string }) => Promise<void>;
  register: (payload: { email: string; username: string; password: string }) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  logoutLocal: () => void;
  setSession: (user: User, accessToken: string) => void;
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

const baseURL = import.meta.env.VITE_API_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
      setSession: (user, accessToken) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false
        });
        scheduleRefresh();
      },
      updateUser: (user) => set({ user }),
      logoutLocal: () => {
        if (refreshTimer) {
          window.clearTimeout(refreshTimer);
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false
        });
      },
      login: async (payload) => {
        set({ isLoading: true });
        const response = await axios.post<ApiResponse<{ user: User; accessToken: string }>>(
          `${baseURL}/auth/login`,
          payload,
          { withCredentials: true }
        );
        get().setSession(response.data.data.user, response.data.data.accessToken);
      },
      register: async (payload) => {
        set({ isLoading: true });
        const response = await axios.post<ApiResponse<{ user: User; accessToken: string }>>(
          `${baseURL}/auth/register`,
          payload,
          { withCredentials: true }
        );
        get().setSession(response.data.data.user, response.data.data.accessToken);
      },
      refreshToken: async () => {
        try {
          const response = await axios.post<ApiResponse<{ user: User; accessToken: string }>>(
            `${baseURL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          get().setSession(response.data.data.user, response.data.data.accessToken);
          return true;
        } catch {
          get().logoutLocal();
          return false;
        }
      },
      logout: async () => {
        try {
          await axios.post(
            `${baseURL}/auth/logout`,
            {},
            {
              withCredentials: true,
              headers: get().accessToken
                ? {
                    Authorization: `Bearer ${get().accessToken}`
                  }
                : undefined
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

