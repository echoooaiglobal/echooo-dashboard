// src/services/influencer-contacts/influencer-contacts.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  InfluencerContact,
  CreateInfluencerContactRequest,
  CreateInfluencerContactResponse,
  GetInfluencerContactsResponse 
} from '@/types/influencer-contacts';

/**
 * Create influencer contact via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function createInfluencerContact(
  contactData: CreateInfluencerContactRequest
): Promise<InfluencerContact> {
  try {
    console.log('🚀 Client Service: Starting createInfluencerContact call');
    console.log('📋 Client Service: Contact data:', contactData);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('createInfluencerContact can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = '/api/v0/influencer-contacts';
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.post<CreateInfluencerContactResponse>(endpoint, contactData);
    
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
      console.warn('⚠️ Client Service: No valid influencer contact data received');
      throw new Error(response.data?.error || 'Failed to create influencer contact');
    }
    
    console.log('✅ Client Service: Successfully created influencer contact');
    console.log('📊 Client Service: Contact data:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in createInfluencerContact:', error);
    
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
 * Get influencer contacts by social account ID via Next.js API route (client-side)
 */
export async function getInfluencerContacts(socialAccountId: string): Promise<InfluencerContact[]> {
  try {
    console.log(`🚀 Client Service: Starting getInfluencerContacts call for ${socialAccountId}`);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getInfluencerContacts can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/influencer-contacts/social-account/${socialAccountId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<GetInfluencerContactsResponse>(endpoint);
    
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
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: No valid influencer contacts data received');
      throw new Error(response.data?.error || 'Failed to get influencer contacts');
    }
    
    const contacts = response.data.data || [];
    console.log(`✅ Client Service: Successfully fetched ${contacts.length} influencer contacts`);
    
    return contacts;
  } catch (error) {
    console.error('💥 Client Service: Error in getInfluencerContacts:', error);
    
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