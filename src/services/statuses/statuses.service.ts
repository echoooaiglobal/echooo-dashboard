// src/services/statuses/statuses.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { Status, filterAllowedStatuses } from '@/types/statuses';

/**
 * Get statuses from Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function getStatuses(model: string = 'list_member'): Promise<Status[]> {
  try {
    console.log(`🚀 Client Service: Starting getStatuses call for model ${model}`);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getStatuses can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/statuses/model/${model}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<Status[]>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      statusCount: response.data?.length || 0
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No statuses data received');
      return [];
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.length} statuses`);
    console.log('📊 Client Service: Full response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getStatuses:', error);
    
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
 * Get list member statuses specifically (client-side)
 * Returns only the allowed statuses for agent dashboard
 */
export async function getListMemberStatuses(): Promise<Status[]> {
  try {
    console.log('🚀 Client Service: Starting getListMemberStatuses call');
    
    const allStatuses = await getStatuses('list_member');
    const allowedStatuses = filterAllowedStatuses(allStatuses);
    
    console.log(`✅ Client Service: Filtered to ${allowedStatuses.length} allowed statuses`);
    console.log('📋 Allowed statuses:', allowedStatuses.map(s => s.name));
    
    return allowedStatuses;
  } catch (error) {
    console.error('💥 Client Service: Error in getListMemberStatuses:', error);
    throw error;
  }
}