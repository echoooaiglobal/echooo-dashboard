// src/services/profile-analytics/profile-analytics.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  ProfileAnalyticsExistsResponse,
  CheckProfileAnalyticsExistsResponse 
} from '@/types/profile-analytics';

/**
 * Check if profile analytics exists for an influencer via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function checkProfileAnalyticsExists(
  platformAccountId: string
): Promise<ProfileAnalyticsExistsResponse> {
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
    
    const response = await nextjsApiClient.get<CheckProfileAnalyticsExistsResponse>(endpoint);
    
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