// src/types/common/Auth.types.ts
import type { AuditTrails } from "./AuditLog.types";

// Login Request & Response
export interface LoginRequest {
  email: string;
  password: string;
}

// Register Request
export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}

// User Profile
export interface User {
  userId: number;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  address: string;
  profileImagePath?: string;
  profilePic?: string;
  passwordHash: string;
  isActive: boolean;
  islocked: boolean;
  createAt: string;
  lastlogin?: string;
  lastloginString?: string;
  createAtSyring: string;
  companyId?: number;
  companyName?: string;
  auditLogs?: AuditTrails[];
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

// Forgot Password Request
export interface ForgotPasswordRequest {
  email: string;
}

// Reset Password Request
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Get Current User Response (for /api/UserAuth/me)
export interface CurrentUserResponse extends User {}

// Logout Response
export interface LogoutResponse {
  message: string;
}