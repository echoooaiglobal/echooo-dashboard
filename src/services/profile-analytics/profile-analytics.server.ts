// src/services/profile-analytics/profile-analytics.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { ProfileAnalyticsExistsResponse } from '@/types/profile-analytics';

/**
 * Check if profile analytics exists for an influencer from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function checkProfileAnalyticsExistsServer(
  platformAccountId: string,
  authToken?: string
): Promise<ProfileAnalyticsExistsResponse> {
  try {
    console.log(`Server: Checking profile analytics existence for platform account ${platformAccountId}`);
    
    const endpoint = ENDPOINTS.PROFILE_ANALYTICS.EXISTS(platformAccountId);
    
    const response = await serverApiClient.get<ProfileAnalyticsExistsResponse>(
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