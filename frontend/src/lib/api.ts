import axios from "axios";
import { ensureCsrfToken, getCsrfHeaders } from "./csrf";

const authBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";
const storefrontBaseUrl = import.meta.env.VITE_STOREFRONT_API_URL ?? "http://localhost:3001/api/v1";
const normalizedAuthBaseUrl = authBaseUrl.replace(/\/+$/, "");
const usesVersionedApi = /\/api\/v\d+$/i.test(normalizedAuthBaseUrl);

const api = axios.create({
  baseURL: authBaseUrl,
  timeout: 8000,
  withCredentials: true
});

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase() ?? "GET";
  if (usesVersionedApi && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    await ensureCsrfToken();
    Object.assign(config.headers, getCsrfHeaders());
  }

  return config;
});

export const storefrontApi = axios.create({
  baseURL: storefrontBaseUrl,
  timeout: 8000
});

export const authPath = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return usesVersionedApi ? normalizedPath : `/api${normalizedPath}`;
};

export const authRedirectUrl = (path: string) => {
  const normalizedPath = authPath(path);
  return `${normalizedAuthBaseUrl}${normalizedPath}`;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as
    | { message?: string; error?: { message?: string } }
    | undefined;

  return data?.error?.message ?? data?.message ?? fallback;
};

export const usesVersionedAuthApi = usesVersionedApi;

export default api;
