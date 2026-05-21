export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string;
  status: string;
  lastLoginAt?: string;
  createdAt?: string;
}