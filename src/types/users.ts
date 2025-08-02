// src/types/users.ts - Updated to import User from auth.ts

import { User, Role } from '@/types/auth';

export interface CompanyBrief {
  id: string;
  name: string;
  domain: string | null;
  created_at: string;
}

export interface UserDetail extends User {
  roles: Role[];
  company: CompanyBrief | null;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  profile_image_url?: string | null;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  department?: string;
  job_title?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  data?: User;
  error?: string;
}

export interface GetUserResponse {
  success: boolean;
  data?: UserDetail;
  error?: string;
}

export interface UserListResponse {
  users: UserDetail[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserStatsResponse {
  total_users: number;
  users_by_type: Record<string, number>;
  users_by_status: Record<string, number>;
  recent_registrations: number;
}

export interface UserStatusUpdate {
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

export interface UserRoleUpdate {
  role_ids: string[];
}

export interface AdminPasswordReset {
  new_password: string;
}

// Updated ProfileFormData interface for components - uses first_name and last_name
export interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  location: string;
  timezone: string;
  language: string;
  profile_image_url: string;
  department?: string;
  job_title?: string;
}

// Password change request interface
export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
  error?: string;
}

// API response types
export interface UserApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Search and filter parameters
export interface UserSearchParams {
  skip?: number;
  limit?: number;
  user_type?: string;
  status?: string;
  search?: string;
}