"use client";
import React, { createContext, useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import { User, LoginRequest, RegisterRequest, AuthResponse } from "@/types/user";

// Define context type
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  reloadUser: () => Promise<void>;
  isLoading: boolean;
  accessToken: string | null;
  isInitializing: boolean;
}

// Context
export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasFetchedMe = useRef(false);

  // Attach token to axios headers
  const attachToken = (token?: string | null) => {
    const t = token ?? accessToken ?? localStorage.getItem("accessToken");
    if (t) {
      api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    }
  };

  // Login function
  async function login(credentials: LoginRequest) {
    const res = await api.post<AuthResponse>("/auth/login", credentials);

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    setAccessToken(res.data.accessToken);
    attachToken(res.data.accessToken);
    setUser(res.data.account);
  }

  // Logout function
  async function logout() {
    const refreshTok = localStorage.getItem("refreshToken");
    try {
      await api.post("/auth/logout", { refreshToken: refreshTok });
    } catch (error: any) {
      if (error?.response?.status !== 403 && error?.response?.status !== 401) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setAccessToken(null);
  }

  // Register function
  async function register(data: RegisterRequest) {
    await api.post("/auth/register", data);
    // Registration successful - user needs to verify email before logging in
  }

  // Refresh token function
  async function refreshToken() {
    const refreshTok = localStorage.getItem("refreshToken");
    if (!refreshTok) return;

    try {
      const res = await api.post<AuthResponse>("/auth/refresh", { refreshToken: refreshTok });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      setAccessToken(res.data.accessToken);
      attachToken(res.data.accessToken);
      setUser(res.data.account);
    } catch (error) {
      console.error("Refresh token failed:", error);
      logout();
    }
  }

  // Reload current user data (useful after profile updates like avatar upload)
  async function reloadUser() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    attachToken(token);
    try {
      const res = await api.get<User>("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error("Failed to reload user:", error);
    }
  }

  // Restore session when app mount
  useEffect(() => {
    if (hasFetchedMe.current) return;
    hasFetchedMe.current = true;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setIsInitializing(false);
      setIsLoading(false);
      return;
    }

    // Đảm bảo attachToken(token) được gọi TRƯỚC khi gọi api.get("/auth/me")
    attachToken(token);

    setAccessToken(token);

    api
      .get("/auth/me")
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      })
      .finally(() => {
        setIsInitializing(false);
        setIsLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      refreshToken,
      setUser,
      reloadUser,
      isLoading,
      accessToken,
      isInitializing
    }}>
      {children}
    </AuthContext.Provider>
  );
}
