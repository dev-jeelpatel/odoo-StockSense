import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getTokens, setTokens } from "./token-store";
import type { ApiErrorBody } from "@/types";

export const apiClient = axios.create({ baseURL: "/api" });

apiClient.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.accessToken) {
    config.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    throw new Error("No refresh token available");
  }
  const { data } = await axios.post<{ accessToken: string }>("/api/auth/refresh", {
    refreshToken: tokens.refreshToken,
  });
  setTokens({ accessToken: data.accessToken, refreshToken: tokens.refreshToken });
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry && getTokens()?.refreshToken) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        original.headers.set("Authorization", `Bearer ${accessToken}`);
        return apiClient(original);
      } catch {
        setTokens(null);
        if (typeof window !== "undefined") {
          window.location.assign("/login");
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) return body.error.message;
  }
  return fallback;
}

export function getApiFieldErrors(error: unknown): Record<string, string> | undefined {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    return body?.error?.fields;
  }
  return undefined;
}
