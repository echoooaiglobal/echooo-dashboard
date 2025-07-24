// src/types/auth.ts - Enhanced with detailed role system
export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

// Main user types (dashboard level)
export type UserType = 'platform' | 'company' | 'influencer';

// Detailed role types for granular permissions
export type PlatformRole = 
  | 'platform_admin'
  | 'platform_user'
  | 'platform_manager'
  | 'platform_accountant'
  | 'platform_developer'
  | 'platform_customer_support'
  | 'platform_content_moderator'
  | 'platform_agent';

export type CompanyRole = 
  | 'b2c_company_owner'
  | 'b2c_company_admin'
  | 'company_user'
  | 'company_manager'
  | 'company_accountant'
  | 'company_marketer'
  | 'company_content_creator';

export type InfluencerRole = 
  | 'influencer'
  | 'influencer_manager';

export type DetailedRole = PlatformRole | CompanyRole | InfluencerRole;

// Permission structure (for future implementation)
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: DetailedRole;
  description: string;
  permissions?: Permission[]; // Optional for future use
}

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

// Role checking utilities types
export interface RoleCheckResult {
  hasRole: boolean;
  userType: UserType | null;
  detailedRole: DetailedRole | null;
  dashboardRoute: string;
}

// Agent-specific types (for campaign list assignments)
export interface AgentAssignment {
  id: string;
  agent_id: string;
  list_id: string;
  assigned_at: string;
  campaign_name: string;
  company_name: string;
  status: 'active' | 'completed' | 'paused';
}

export interface CampaignListMember {
  id: string;
  list_id: string;
  influencer_id: string;
  influencer_username: string;
  influencer_name: string;
  influencer_followers: string;
  influencer_engagement_rate: string;
  contact_status: 'not_contacted' | 'contacted' | 'responded' | 'declined' | 'accepted';
  contact_attempts: number;
  last_contacted_at: string | null;
  notes: string | null;
  assigned_agent_id: string;
  created_at: string;
  updated_at: string;
}