// src/types/auth.ts
export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export type UserType = 'platform' | 'company' | 'influencer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  status: string;
  email_verified: boolean;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  user_type: UserType;
  company_name?: string;
  company_domain?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  roles: Role[];
  refresh_token: string;
  company: Company[];
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  user_type: UserType;
  company_name?: string;
  company_domain?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  user_type: UserType;
  company_name?: string;
  company_domain?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface AuthState {
  user: User | null;
  roles: Role[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}