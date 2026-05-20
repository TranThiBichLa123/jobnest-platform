export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;  // Changed from avatar_url to match backend camelCase
  status: AccountStatus;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  account: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
