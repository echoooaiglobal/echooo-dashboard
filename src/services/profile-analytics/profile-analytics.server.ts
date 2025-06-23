// src/services/profile-analytics/profile-analytics.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  AnalyticsExistenceResponse,
  SaveAnalyticsRequest,
  SaveAnalyticsResponse,
  BackendAnalyticsResponse
} from '@/types/profile-analytics';

/**
 * Check if profile analytics exists for an influencer from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function checkProfileAnalyticsExistsServer(
  platformAccountId: string,
  authToken?: string
): Promise<AnalyticsExistenceResponse> {
  try {
    console.log(`Server: Checking profile analytics existence for platform account ${platformAccountId}`);
    
    const endpoint = ENDPOINTS.PROFILE_ANALYTICS.EXISTS(platformAccountId);
    
    const response = await serverApiClient.get<AnalyticsExistenceResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error checking profile analytics existence:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No profile analytics data received from FastAPI');
      throw new Error('No profile analytics data received');
    }
    
    console.log('Server: Profile analytics check completed successfully:', {
      platformAccountId,
      exists: response.data.exists,
      analyticsCount: response.data.analytics_count
    });
    
    return response.data;
  } catch (error) {
    console.error(`Server: Error checking profile analytics for ${platformAccountId}:`, error);
    throw error;
  }
}

/**
 * Get profile analytics by handle from FastAPI backend (server-side)
 * Returns the raw backend response - could be success, not found, or error
 */
export async function getProfileAnalyticsByHandleServer(
  platformAccountId: string,
  authToken?: string
): Promise<BackendAnalyticsResponse> {
  try {
    console.log(`Server: Getting profile analytics for platform account ${platformAccountId}`);
    
    const endpoint = ENDPOINTS.PROFILE_ANALYTICS.BY_HANDLE(platformAccountId);
    
    const response = await serverApiClient.get<BackendAnalyticsResponse>(
      endpoint,
      {},
      authToken
    );
    
    // Handle different response scenarios
    if (response.error) {
      console.error('Server: FastAPI Error getting profile analytics:', response.error);
      
      // Check if it's a 404 "not found" error
      if (response.status === 404) {
        console.log('Server: Analytics not found (404) - this is expected for new accounts');
        // Return the error response as-is so the caller can handle it
        return response.data || { detail: response.error.message };
      }
      
      // For other errors, throw
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No profile analytics data received from FastAPI');
      throw new Error('No profile analytics data received');
    }
    
    console.log('Server: Profile analytics response received:', {
      platformAccountId,
      responseType: 'analytics_data' in response.data ? 'success' : 
                   'detail' in response.data ? 'not_found' : 'unknown'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Server: Error getting profile analytics for ${platformAccountId}:`, error);
    throw error;
  }
}

/**
 * Save profile analytics with social account data to FastAPI backend (server-side)
 */
export async function saveProfileAnalyticsWithSocialAccountServer(
  requestData: SaveAnalyticsRequest,
  authToken?: string
): Promise<SaveAnalyticsResponse> {
  try {
    console.log(`Server: Saving profile analytics with social account data`);
    
    const endpoint = ENDPOINTS.PROFILE_ANALYTICS.WITH_SOCIAL_ACCOUNT;
    
    const response = await serverApiClient.post<SaveAnalyticsResponse>(
      endpoint,
      requestData,
      {}, // No additional query params needed
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error saving profile analytics:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No response data received from FastAPI');
      throw new Error('No response data received');
    }
    
    console.log('Server: Profile analytics saved successfully');
    
    return response.data;
  } catch (error) {
    console.error(`Server: Error saving profile analytics:`, error);
    throw error;
  }
}