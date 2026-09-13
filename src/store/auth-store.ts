import { create } from "zustand";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  hydrate: () => void;
}

const getInitialToken = (key: string) => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getInitialToken(ACCESS_TOKEN_KEY),
  refreshToken: getInitialToken(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    set({ accessToken, refreshToken });
  },
  clearTokens: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    set({ accessToken: null, refreshToken: null });
  },
  hydrate: () => {
    set({
      accessToken: getInitialToken(ACCESS_TOKEN_KEY),
      refreshToken: getInitialToken(REFRESH_TOKEN_KEY),
    });
  },
}));
