// src/types/user-detailed-info.ts

// Generic type for handling large, unknown API responses
export type ThirdPartyApiResponse = Record<string, any>;

// Core user information extracted from Instagram response
export interface InstagramUserInfo {
  user_ig_id: string;
  full_name: string;
  profile_pic_url: string;
  username: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_verified?: boolean;
  is_private?: boolean;
  biography?: string;
}

// Core post information extracted from Instagram response
export interface InstagramPostInfo {
  post_id: string;
  shortcode: string;
  caption?: string;
  created_at: string;
  video_url?: string;
  view_counts?: number;
  play_counts?: number;
  title?: string;
  video_duration?: number;
  media_preview?: string;
  thumbnail_src?: string;
  display_url?: string;
  comments_count: number;
  likes_count: number;
  media_type: 'image' | 'video' | 'carousel';
  is_video: boolean;
  has_audio?: boolean;
}

// Processed Instagram data for our system
export interface ProcessedInstagramData {
  user: InstagramUserInfo;
  post: InstagramPostInfo;
  success: boolean;
  message?: string;
  raw_response?: ThirdPartyApiResponse; // Store the full response for debugging/future use
}

// Backend API Types - Based on your actual backend structure
export interface VideoResult {
  id: string;
  campaign_id: string;
  user_ig_id: string;
  full_name: string;
  influencer_username: string;
  profile_pic_url: string;
  post_id: string;
  title: string;
  views_count: number;
  plays_count: number;
  likes_count: number;
  comments_count: number;
  media_preview: string;
  followers_count?: number;
  duration: number;
  thumbnail: string;
  post_created_at: string | null;
  post_result_obj: ThirdPartyApiResponse;
  created_at: string;
  updated_at: string;
}

// Request types for backend API
export interface CreateVideoResultRequest {
  campaign_id: string;
  user_ig_id: string;
  full_name: string;
  influencer_username: string;
  profile_pic_url: string;
  post_id: string;
  title: string;
  views_count: number;
  plays_count: number;
  likes_count: number;
  comments_count: number;
  media_preview: string;
  duration: number;
  thumbnail: string;
  post_created_at: string;
  post_result_obj: ThirdPartyApiResponse;
}

export interface UpdateVideoResultRequest {
  user_ig_id?: string;
  full_name?: string;
  influencer_username?: string;
  profile_pic_url?: string;
  post_id?: string;
  title?: string;
  views_count?: number;
  plays_count?: number;
  likes_count?: number;
  comments_count?: number;
  media_preview?: string;
  duration?: number;
  thumbnail?: string;
  post_created_at?: string;
  post_result_obj?: ThirdPartyApiResponse;
}

// Response types from backend API
export interface CreateVideoResultResponse {
  success: boolean;
  data: VideoResult;
  error?: string;
}

export interface UpdateVideoResultResponse {
  success: boolean;
  data: VideoResult;
  error?: string;
}

export interface GetVideoResultsResponse {
  campaign_id: string;
  results: VideoResult[];
  total: number;
  success?: boolean;
  error?: string;
}

// Utility Types
export interface InstagramPostInput {
  url?: string;
  code?: string;
}

export interface InstagramApiError {
  message: string;
  code?: string;
  status?: number;
}

// Helper function types
export type DataExtractor = (response: ThirdPartyApiResponse) => ProcessedInstagramData;
export type BackendDataMapper = (processed: ProcessedInstagramData, campaignId: string) => CreateVideoResultRequest;