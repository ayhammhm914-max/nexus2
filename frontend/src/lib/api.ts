import axios from "axios";
import { getAccessToken } from "../features/auth/token";

const authBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const storefrontBaseUrl = import.meta.env.VITE_STOREFRONT_API_URL ?? "http://localhost:3001/api/v1";

const api = axios.create({
  baseURL: authBaseUrl,
  timeout: 8000
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const storefrontApi = axios.create({
  baseURL: storefrontBaseUrl,
  timeout: 8000
});

export default api;
