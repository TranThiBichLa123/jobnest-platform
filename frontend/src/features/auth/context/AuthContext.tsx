"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import api, { tokenStorage } from "@/shared/api/http";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserRole,
} from "@/shared/types/user";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  reloadUser: () => Promise<void>;
  isLoading: boolean;
  accessToken: string | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  isCandidate: boolean;
  isEmployer: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function normalizeRole(role?: string): UserRole {
  const cleaned = (role || "CANDIDATE").replace("ROLE_", "").toUpperCase();

  if (cleaned === "ADMIN") return "ADMIN";
  if (cleaned === "EMPLOYER") return "EMPLOYER";
  return "CANDIDATE";
}

function normalizeUser(raw: any): User {
  return {
    ...raw,
    role: normalizeRole(raw?.role),
    avatarUrl: raw?.avatarUrl || raw?.avatar_url || "",
    created_at: raw?.created_at || raw?.createdAt || "",
    updated_at: raw?.updated_at || raw?.updatedAt || "",
    last_login_at: raw?.last_login_at || raw?.lastLoginAt || "",
  };
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitialized = useRef(false);

  const setUser = (nextUser: User | null) => {
    setUserState(nextUser ? normalizeUser(nextUser) : null);
  };

  const reloadUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();

    if (!token) {
      setUser(null);
      setAccessToken(null);
      return;
    }

    try {
      const response = await api.get<User>("/auth/me");
      setUser(response.data);
    } catch {
      tokenStorage.clearTokens();
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  async function login(credentials: LoginRequest): Promise<User> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    const { accessToken, refreshToken, account } = response.data;

    tokenStorage.setTokens(accessToken, refreshToken);
    setAccessToken(accessToken);

    if (account) {
      const normalized = normalizeUser(account);
      setUserState(normalized);
      return normalized;
    }

    const meResponse = await api.get<User>("/auth/me");
    const normalized = normalizeUser(meResponse.data);
    setUserState(normalized);
    return normalized;
  }

  async function logout() {
    const currentRefreshToken = tokenStorage.getRefreshToken();

    try {
      if (currentRefreshToken) {
        await api.post("/auth/logout", {
          refreshToken: currentRefreshToken,
        });
      }
    } catch {
      // Client-side logout still has to continue even if backend rejects an old token.
    } finally {
      tokenStorage.clearTokens();
      setAccessToken(null);
      setUser(null);

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  async function register(data: RegisterRequest) {
    await api.post("/auth/register", data);
  }

  async function refreshToken() {
    const currentRefreshToken = tokenStorage.getRefreshToken();

    if (!currentRefreshToken) {
      tokenStorage.clearTokens();
      setUser(null);
      setAccessToken(null);
      return;
    }

    const response = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken: currentRefreshToken,
    });

    const newAccessToken = response.data.accessToken;
    const newRefreshToken = response.data.refreshToken || currentRefreshToken;

    tokenStorage.setTokens(newAccessToken, newRefreshToken);
    setAccessToken(newAccessToken);

    if (response.data.account) {
      setUser(response.data.account);
    } else {
      await reloadUser();
    }
  }

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();

      if (!token) {
        setUser(null);
        setAccessToken(null);
        setIsLoading(false);
        setIsInitializing(false);
        return;
      }

      setAccessToken(token);

      try {
        const response = await api.get<User>("/auth/me");
        setUser(response.data);
      } catch {
        tokenStorage.clearTokens();
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    initAuth();

    const handleAuthExpired = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener("jobnest:auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("jobnest:auth-expired", handleAuthExpired);
    };
  }, []);

  const role = user?.role;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        refreshToken,
        setUser,
        reloadUser,
        isLoading,
        accessToken,
        isInitializing,
        isAuthenticated: Boolean(user),
        isCandidate: role === "CANDIDATE",
        isEmployer: role === "EMPLOYER",
        isAdmin: role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}