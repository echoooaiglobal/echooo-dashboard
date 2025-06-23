// src/services/profile-analytics/profile-analytics.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  AnalyticsExistenceResponse,
  AnalyticsExistenceCheckResponse,
  SaveAnalyticsRequest,
  SaveAnalyticsResponse,
  BackendAnalyticsResponse,
  SocialAccountCreateData,
  isSuccessfulAnalyticsResponse,
  isAnalyticsNotFoundError,
  isAnalyticsApiError
} from '@/types/profile-analytics';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';

/**
 * Check if profile analytics exists for an influencer via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function checkProfileAnalyticsExists(
  platformAccountId: string
): Promise<AnalyticsExistenceResponse> {
  try {
    console.log(`🚀 Client Service: Starting checkProfileAnalyticsExists call for ${platformAccountId}`);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('checkProfileAnalyticsExists can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/profile-analytics/exists/${platformAccountId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<AnalyticsExistenceCheckResponse>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Client Service: No valid profile analytics data received');
      throw new Error(response.data?.error || 'Failed to check profile analytics existence');
    }
    
    console.log('✅ Client Service: Successfully checked profile analytics existence');
    console.log('📊 Client Service: Analytics data:', {
      exists: response.data.data.exists,
      analyticsCount: response.data.data.analytics_count,
      latestDate: response.data.data.latest_analytics_date
    });
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in checkProfileAnalyticsExists:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

/**
 * Get profile analytics by handle via Next.js API route (client-side)
 * Returns the raw backend response and lets the caller handle the different cases
 */
export async function getProfileAnalyticsByHandle(
  platformAccountId: string
): Promise<BackendAnalyticsResponse> {
  try {
    console.log(`🚀 Client Service: Getting profile analytics for ${platformAccountId}`);
    
    const endpoint = `/api/v0/profile-analytics/by-handle/${platformAccountId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<BackendAnalyticsResponse>(endpoint);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No profile analytics data received');
      throw new Error('No profile analytics data received');
    }
    
    // Log the type of response we received
    if (isSuccessfulAnalyticsResponse(response.data)) {
      console.log('✅ Client Service: Successfully retrieved profile analytics', {
        analyticsCount: response.data.analytics_count,
        hasData: response.data.analytics_data.length > 0
      });
    } else if (isAnalyticsNotFoundError(response.data)) {
      console.log('ℹ️ Client Service: Analytics not found:', response.data.detail);
    } else if (isAnalyticsApiError(response.data)) {
      console.warn('⚠️ Client Service: API error response:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getProfileAnalyticsByHandle:', error);
    throw error;
  }
}

/**
 * Save profile analytics with social account data via Next.js API route (client-side)
 */
export async function saveProfileAnalyticsWithSocialAccount(
  requestData: SaveAnalyticsRequest
): Promise<SaveAnalyticsResponse> {
  try {
    console.log('🚀 Client Service: Saving profile analytics with social account data');
    
    const endpoint = '/api/v0/profile-analytics/with-social-account';
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.post<SaveAnalyticsResponse>(endpoint, requestData);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully saved profile analytics');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in saveProfileAnalyticsWithSocialAccount:', error);
    throw error;
  }
}

/**
 * Transform InsightIQ response to social account data format
 */
export function transformToSocialAccountData(
  insightIqResponse: InsightIQProfileAnalyticsResponse,
  platformId: string
): SocialAccountCreateData {
  const { profile } = insightIqResponse;
  
  return {
    platform_id: platformId,
    platform_account_id: profile.external_id,
    account_handle: profile.platform_username,
    full_name: profile.full_name,
    profile_pic_url: profile.image_url,
    account_url: profile.url,
    is_private: false, // InsightIQ doesn't provide this, defaulting to false
    is_verified: profile.is_verified,
    is_business: profile.platform_account_type === 'BUSINESS',
    media_count: profile.content_count,
    followers_count: profile.follower_count,
    following_count: 0, // InsightIQ doesn't provide this in current response
    likes_count: 0, // InsightIQ doesn't provide total likes
    biography: profile.introduction,
    has_highlight_reels: false, // InsightIQ doesn't provide this
    has_clips: false, // InsightIQ doesn't provide this
    additional_metrics: {
      id: profile.external_id,
      url: profile.url,
      name: profile.full_name,
      gender: profile.gender,
      language: profile.language,
      username: profile.platform_username,
      age_group: profile.age_group,
      followers: formatFollowerCount(profile.follower_count),
      isVerified: profile.is_verified,
      engagements: "0", // Default value
      external_id: profile.external_id,
      introduction: profile.introduction,
      profileImage: profile.image_url,
      average_likes: profile.average_likes,
      average_views: profile.average_views,
      content_count: profile.content_count,
      engagementRate: profile.engagement_rate,
      subscriber_count: profile.subscriber_count,
      livestream_metrics: null,
      platform_account_type: profile.platform_account_type
    }
  };
}

/**
 * Format follower count to string format (e.g., "46.1M")
 */
function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}