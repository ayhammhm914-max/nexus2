import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  timeout: 8000,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await useAuthStore.getState().refreshToken();
      if (refreshed) {
        originalRequest.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
        return api(originalRequest);
      }
    }

    if (error.response?.status === 403) {
      window.location.href = "/";
    }

    if (error.response?.status === 429) {
      toast.error("Too many requests. Please slow down.");
    }

    if (error.response?.status >= 500) {
      toast.error("Server error. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default api;
