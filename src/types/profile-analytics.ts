// src/types/profile-analytics.ts

import { InsightIQProfileAnalyticsResponse, Profile } from './insightiq/profile-analytics';

// Backend Analytics Record - Single analytics entry from database
export interface BackendAnalyticsRecord {
  id: string;
  social_account_id: string;
  analytics: InsightIQProfileAnalyticsResponse;
  created_at: string;
  updated_at: string;
  social_account: BackendSocialAccount | null;
}

// Backend Social Account Data
export interface BackendSocialAccount {
  id: string;
  platform_id: string;
  platform_account_id: string;
  account_handle: string;
  full_name: string;
  profile_pic_url: string;
  account_url: string;
  is_private: boolean;
  is_verified: boolean;
  is_business: boolean;
  media_count: number;
  followers_count: number;
  following_count: number;
  likes_count: number;
  biography: string;
  has_highlight_reels: boolean;
  has_clips: boolean;
  additional_metrics: any;
  created_at: string;
  updated_at: string;
}

// Successful response when analytics data is found
export interface SuccessfulAnalyticsResponse {
  analytics_data: BackendAnalyticsRecord[];
  analytics_count: number;
}

// Error response when analytics not found (404)
export interface AnalyticsNotFoundError {
  detail: string;
}

// Generic error response for other errors
export interface AnalyticsApiError {
  error?: string;
  detail?: string;
  message?: string;
}

// Union type for all possible backend responses
export type BackendAnalyticsResponse = 
  | SuccessfulAnalyticsResponse 
  | AnalyticsNotFoundError 
  | AnalyticsApiError;

// Type guard to check if response is successful
export function isSuccessfulAnalyticsResponse(
  response: BackendAnalyticsResponse
): response is SuccessfulAnalyticsResponse {
  return 'analytics_data' in response && 'analytics_count' in response;
}

// Type guard to check if response is "not found" error
export function isAnalyticsNotFoundError(
  response: BackendAnalyticsResponse
): response is AnalyticsNotFoundError {
  return 'detail' in response && 
         typeof (response as AnalyticsNotFoundError).detail === 'string';
}

// Type guard to check if response is a general error
export function isAnalyticsApiError(
  response: BackendAnalyticsResponse
): response is AnalyticsApiError {
  return 'error' in response || ('detail' in response && !isAnalyticsNotFoundError(response));
}

// ============= PROFILE DATA INTERFACE =============
// Updated to match the actual Profile interface from InsightIQ

/** @deprecated Use Profile from insightiq/profile-analytics instead */
export interface ProfileData {
  image_url: string;
  full_name: string;
  platform_username: string;
  introduction: string;
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
  };
  language: string;
  url: string;
  follower_count: number;
  is_verified: boolean;
  updated_at: string;
  engagement_rate: number;
  average_likes: number;
  average_comments: number;
  average_reels_views: number;
  platform_account_type: string;
  gender: string;
  age_group: string;
  content_count: number;
  posts_hidden_likes_percentage_value: number;
  contact_details: Array<{
    type: string;
    value: string;
    label: string;
    verified?: boolean | null;
  }>;
  top_interests: Array<{
    name: string;
  }>;
  brand_affinity: Array<{
    name: string;
    value?: number;
    id?: string;
  }>;
}

// ============= SOCIAL ACCOUNT DATA FOR SAVING =============

export interface SocialAccountCreateData {
  platform_id: string;
  platform_account_id: string;
  account_handle: string;
  full_name: string;
  profile_pic_url: string;
  account_url: string;
  is_private: boolean;
  is_verified: boolean;
  is_business: boolean;
  media_count: number;
  followers_count: number;
  following_count: number;
  likes_count: number;
  biography: string;
  has_highlight_reels: boolean;
  has_clips: boolean;
  additional_metrics: {
    id: string;
    url: string;
    name: string;
    gender: string;
    language: string;
    username: string;
    age_group: string;
    followers: string;
    isVerified: boolean;
    engagements: string;
    external_id: string;
    introduction: string;
    profileImage: string;
    average_likes: number;
    average_views: number | null;
    content_count: number | null;
    engagementRate: number;
    subscriber_count: number | null;
    livestream_metrics: any;
    platform_account_type: string;
  };
}

// ============= API REQUEST/RESPONSE INTERFACES =============

// Request payload for saving analytics
export interface SaveAnalyticsRequest {
  social_account_data: SocialAccountCreateData;
  analytics: InsightIQProfileAnalyticsResponse;
}

// Response from backend when saving analytics
export interface SaveAnalyticsResponse {
  analytics: any;
  message: string;
}

// Response when checking if analytics exists
export interface AnalyticsExistenceResponse {
  exists: boolean;
  analytics_count: number;
  latest_analytics_date?: string;
}

// Wrapper response for analytics existence check
export interface AnalyticsExistenceCheckResponse {
  success: boolean;
  data?: AnalyticsExistenceResponse;
  error?: string;
}

// ============= LEGACY TYPES (for backwards compatibility) =============
// These can be gradually replaced with the new types above

export interface AnalyticsData {
  id: string;
  social_account_id: string;
  analytics: InsightIQProfileAnalyticsResponse;
  created_at: string;
  updated_at: string;
}

export interface ProfileAnalyticsDataResponse {
  analytics_count: number;
  analytics_data: AnalyticsData[];
}

export interface ProfileAnalyticsResponse {
  success: boolean;
  data?: ProfileAnalyticsDataResponse;
  error?: string;
}

// ============= DEPRECATED ALIASES (for backwards compatibility) =============
// These should be gradually replaced throughout the codebase

/** @deprecated Use BackendAnalyticsRecord instead */
export type BackendAnalyticsItem = BackendAnalyticsRecord;

/** @deprecated Use SuccessfulAnalyticsResponse instead */
export type BackendProfileAnalyticsResponse = SuccessfulAnalyticsResponse;

/** @deprecated Use AnalyticsNotFoundError instead */
export interface NoAnalyticsResponse {
  message: string;
  exists: false;
}

/** @deprecated Use BackendAnalyticsResponse instead */
export type GetProfileAnalyticsResponse = BackendAnalyticsResponse;

/** @deprecated Use SocialAccountCreateData instead */
export type SocialAccountData = SocialAccountCreateData;

/** @deprecated Use SaveAnalyticsRequest instead */
export type SaveProfileAnalyticsRequest = SaveAnalyticsRequest;

/** @deprecated Use SaveAnalyticsResponse instead */
export type SaveProfileAnalyticsResponse = SaveAnalyticsResponse;

/** @deprecated Use AnalyticsExistenceResponse instead */
export type ProfileAnalyticsExistsResponse = AnalyticsExistenceResponse;

/** @deprecated Use AnalyticsExistenceCheckResponse instead */
export type CheckProfileAnalyticsExistsResponse = AnalyticsExistenceCheckResponse;