import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { getTokens, setTokens } from "@/lib/token-store";
import type { User, UserRole } from "@/types";

const USER_STORAGE_KEY = "stocksense.user";

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistUser(user: User | null) {
  try {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => (getTokens() ? loadStoredUser() : null));

  const applySession = useCallback((session: AuthSession) => {
    setTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken });
    persistUser(session.user);
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post<AuthSession>("/auth/login", { email, password });
      applySession(data);
    },
    [applySession],
  );

  const signup = useCallback(
    async (input: { name: string; email: string; password: string; role: UserRole }) => {
      const { data } = await apiClient.post<AuthSession>("/auth/signup", input);
      applySession(data);
    },
    [applySession],
  );

  const logout = useCallback(() => {
    setTokens(null);
    persistUser(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isReady: true, login, signup, logout }),
    [user, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
