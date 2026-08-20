import { http } from '@/api/client';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from '@/types/api';

/**
 * Authentication service for NEXHIRE AI.
 * End-to-end management for identity, password reset, and email verification.
 */
export const authService = {
  /**
   * Request password reset link for registered account.
   */
  async forgotPassword(email: string): Promise<MessageResponse> {
    return http.post<MessageResponse>('/auth/forgot-password', { email } satisfies ForgotPasswordRequest);
  },

  /**
   * Reset user password using unique token and new strong password.
   */
  async resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
    return http.post<MessageResponse>('/auth/reset-password', {
      token,
      newPassword,
    } satisfies ResetPasswordRequest);
  },

  /**
   * Authenticate user with credentials.
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return http.post<LoginResponse>('/auth/login', payload);
  },

  /**
   * Register new user account.
   */
  async register(payload: RegisterRequest): Promise<LoginResponse> {
    return http.post<LoginResponse>('/auth/register', payload);
  },

  /**
   * Log out active session.
   */
  async logout(): Promise<MessageResponse> {
    return http.post<MessageResponse>('/auth/logout');
  },

  /**
   * Fetch current authenticated user.
   */
  async getCurrentUser(): Promise<User> {
    return http.get<User>('/auth/me');
  },

  /**
   * Update profile information for authenticated user.
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<User> {
    return http.put<User>('/users/me', payload);
  },
};
