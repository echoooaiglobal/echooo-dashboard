// src/services/campaign-list-members/campaign-list-members.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  CampaignListMember, 
  UpdateCampaignListMemberRequest,
  UpdateCampaignListMemberResponse 
} from '@/types/campaign-list-members';

/**
 * Update campaign list member via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function updateCampaignListMember(
  memberId: string,
  updateData: UpdateCampaignListMemberRequest
): Promise<CampaignListMember> {
  try {
    console.log(`🚀 Client Service: Starting updateCampaignListMember call for member ${memberId}`);
    console.log('📋 Client Service: Update data:', updateData);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('updateCampaignListMember can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/campaign-list-members/${memberId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.patch<UpdateCampaignListMemberResponse>(endpoint, updateData);
    
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
      console.warn('⚠️ Client Service: No valid campaign list member data received');
      throw new Error(response.data?.error || 'Failed to update campaign list member');
    }
    
    console.log(`✅ Client Service: Successfully updated campaign list member ${memberId}`);
    console.log('📊 Client Service: Updated member data:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignListMember:', error);
    
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
 * Get campaign list member by ID via Next.js API route (client-side)
 */
export async function getCampaignListMember(memberId: string): Promise<CampaignListMember> {
  try {
    console.log(`🚀 Client Service: Starting getCampaignListMember call for member ${memberId}`);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getCampaignListMember can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/campaign-list-members/${memberId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<CampaignListMember>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No campaign list member data received');
      throw new Error('No campaign list member data received');
    }
    
    console.log(`✅ Client Service: Successfully fetched campaign list member ${memberId}`);
    console.log('📊 Client Service: Member data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getCampaignListMember:', error);
    
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