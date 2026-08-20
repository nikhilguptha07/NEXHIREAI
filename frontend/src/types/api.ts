/**
 * NEXHIRE AI — Shared API types (Volume 1 baseline).
 * Domain types will expand per module.
 */

export type UUID = string;
export type ISODateString = string;

export interface ProblemDetail {
  /** RFC 9457 problem+json shape returned by Spring. */
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
  timestamp?: ISODateString;
  fieldErrors?: Record<string, string[]>;
}

export interface TenantScoped {
  tenantId: UUID;
}

export interface Auditable {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy?: UUID;
  updatedBy?: UUID;
}

export interface User {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  locale: string;
  timezone: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DELETED';
  roles: UserRole[];
  mfaEnabled: boolean;
  lastLoginAt?: ISODateString;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'RECRUITER'
  | 'HIRING_MANAGER'
  | 'INTERVIEWER'
  | 'CANDIDATE';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  acceptTerms: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'SUBMITTED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEWED'
  | 'INTERVIEW_COMPLETED'
  | 'SELECTED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';
