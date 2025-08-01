// src/types/users.ts

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  status: string;
  user_type: string | null;
  email_verified: boolean;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

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
  full_name?: string;
  phone_number?: string;
  profile_image_url?: string;
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

// Profile form data interface for components
export interface ProfileFormData {
  full_name: string;
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