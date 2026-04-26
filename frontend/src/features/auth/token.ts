import type { AuthUser } from "./context/AuthContext";

let accessToken: string | null = null;
let memoryUser: AuthUser | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export const setMemoryUser = (user: AuthUser | null) => {
  memoryUser = user;
};

export const getMemoryUser = () => memoryUser;
