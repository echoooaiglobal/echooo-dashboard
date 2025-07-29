// src/services/campaign-influencers/campaign-influencers.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { apiClient } from '@/lib/api'; // Import the unified API client
import { ENDPOINTS } from '@/services/api/endpoints';
import { DiscoverInfluencer } from '@/lib/types';
import { Influencer } from '@/types/insights-iq';
import { 
  CampaignListMember, 
  UpdateCampaignInfluencerRequest,
  UpdateCampaignInfluencerResponse,
  CampaignInfluencersResponse,
  AddToCampaignListRequest,
  PaginationInfo,
  MarkOnboardedRequest,
  MarkOnboardedResponse,
  RemoveOnboardedRequest,
  RemoveOnboardedResponse
} from '@/types/campaign-influencers';

/**
 * Update campaign list member via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function updateCampaignInfluencer(
  id: string,
  updateData: UpdateCampaignInfluencerRequest
): Promise<CampaignListMember> {
  try {
    const endpoint = `/api/v0/campaign-influencers/${id}`;
    const response = await nextjsApiClient.patch<UpdateCampaignInfluencerResponse>(endpoint, updateData);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Client Service: No valid campaign list member data received');
      throw new Error(response.data?.error || 'Failed to update campaign list member');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignInfluencer:', error);
    
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
 * Update campaign influencer status via Next.js API route (client-side)
 */
export async function updateCampaignInfluencerStatus(
  id: string,
  assignedInfluencerId: string,
  statusId: string
): Promise<{ success: boolean; message: string; influencer_id: string }> {
  try {
    console.log('📤 Client Service: Updating campaign influencer status:', { id, statusId });
    
    const endpoint = `/api/v0/campaign-influencers/${id}/status`;
    const response = await nextjsApiClient.patch<{
      success: boolean;
      message: string;
      influencer_id: string;
    }>(endpoint, { assigned_influencer_id: assignedInfluencerId, status_id: statusId });

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: Status update failed');
      throw new Error('Failed to update status');
    }
    
    console.log('✅ Client Service: Status updated successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignInfluencerStatus:', error);
    
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
 * Update campaign influencer price and currency via Next.js API route (client-side)
 */
export async function updateCampaignInfluencerPrice(
  id: string,
  price: number | null,
  currency: string = 'USD'
): Promise<{ success: boolean; message: string; influencer_id: string }> {
  try {
    console.log('📤 Client Service: Updating campaign influencer price:', { id, price, currency });
    
    const endpoint = `/api/v0/campaign-influencers/${id}/price`;
    const response = await nextjsApiClient.patch<{
      success: boolean;
      message: string;
      influencer_id: string;
    }>(endpoint, { 
      collaboration_price: price,
      currency: currency
    });

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: Price update failed');
      throw new Error('Failed to update price');
    }
    
    console.log('✅ Client Service: Price updated successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignInfluencerPrice:', error);
    
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
export async function getCampaignInfluencer(id: string): Promise<CampaignListMember> {
  try {
    const endpoint = `/api/v0/campaign-influencers/${id}`;
    
    const response = await nextjsApiClient.get<CampaignListMember>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No campaign list member data received');
      throw new Error('No campaign list member data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getCampaignInfluencer:', error);
    
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

// ============ ONBOARDING FUNCTIONS ============

/**
 * Mark influencers as onboarded via Next.js API route (client-side)
 */
export async function markInfluencersOnboarded(
  campaignListId: string,
  influencerIds: string[]
): Promise<MarkOnboardedResponse> {
  try {
    console.log('📤 Client Service: Marking influencers as onboarded:', { campaignListId, influencerIds });
    
    const endpoint = '/api/v0/campaign-influencers/mark-onboarded';
    const requestData: MarkOnboardedRequest = {
      campaign_list_id: campaignListId,
      influencer_ids: influencerIds
    };
    
    const response = await nextjsApiClient.patch<MarkOnboardedResponse>(endpoint, requestData);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received from server');
    }

    // Log the actual response to debug the issue
    console.log('📊 Client Service: Response received for mark onboarded:', response.data);
    
    // Check if the message indicates success (even if success flag is false)
    const isActuallySuccessful = response.data.message && 
      (response.data.message.includes('successfully') || 
       response.data.message.includes('marked') ||
       response.data.message.includes('onboarded'));
    
    if (!response.data.success && !isActuallySuccessful) {
      console.warn('⚠️ Client Service: Mark onboarded failed');
      throw new Error(response.data.message || 'Failed to mark influencers as onboarded');
    }
    
    console.log('✅ Client Service: Influencers marked as onboarded successfully');
    
    // Return success response even if the success flag is wrong
    return {
      success: true,
      message: response.data.message || 'Influencers marked as onboarded successfully'
    };
  } catch (error) {
    console.error('💥 Client Service: Error in markInfluencersOnboarded:', error);
    
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
 * Remove onboarded influencers via Next.js API route (client-side)
 */
export async function removeOnboardedInfluencers(
  campaignListId: string,
  influencerIds: string[]
): Promise<RemoveOnboardedResponse> {
  try {
    console.log('📤 Client Service: Removing onboarded influencers:', { campaignListId, influencerIds });
    
    const endpoint = '/api/v0/campaign-influencers/remove-onboarded';
    const requestData: RemoveOnboardedRequest = {
      campaign_list_id: campaignListId,
      influencer_ids: influencerIds
    };
    
    const response = await nextjsApiClient.patch<RemoveOnboardedResponse>(endpoint, requestData);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received from server');
    }

    // Log the actual response to debug the issue
    console.log('📊 Client Service: Response received for remove onboarded:', response.data);
    
    // Check if the message indicates success (even if success flag is false)
    const isActuallySuccessful = response.data.message && 
      (response.data.message.includes('successfully') || 
       response.data.message.includes('removed') ||
       response.data.message.includes('onboarded'));
    
    if (!response.data.success && !isActuallySuccessful) {
      console.warn('⚠️ Client Service: Remove onboarded failed');
      throw new Error(response.data.message || 'Failed to remove onboarded influencers');
    }
    
    console.log('✅ Client Service: Onboarded influencers removed successfully');
    
    // Return success response even if the success flag is wrong
    return {
      success: true,
      message: response.data.message || 'Onboarded influencers removed successfully'
    };
  } catch (error) {
    console.error('💥 Client Service: Error in removeOnboardedInfluencers:', error);
    
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
// ============ MIGRATED FUNCTIONS FROM campaign-list.service.ts ============

/**
 * Get paginated campaign influencers (migrated from getCampaignListMembers)
 * @param campaign_list_id The campaign list ID
 * @param page Page number (1-based)
 * @param pageSize Items per page
 * @returns Response with paginated campaign influencers
 */
export async function getCampaignInfluencers(
  campaign_list_id: string,
  page: number = 1,
  pageSize: number = 10
): Promise<CampaignInfluencersResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      list_id: campaign_list_id
    });

    const response = await apiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
    }>(`${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBERS('')}?${queryParams}`);

    if (response.error) {
      console.error('Error fetching paginated campaign influencers:', response.error);
      return { 
        success: false, 
        influencers: [],
        pagination: {
          page: 1,
          page_size: pageSize,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_previous: false
        },
        message: response.error.message 
      };
    }

    return {
      success: true,
      influencers: response.data?.influencers || [],
      pagination: response.data?.pagination || {
        page: 1,
        page_size: pageSize,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      }
    };
  } catch (error) {
    console.error('Unexpected error fetching paginated campaign influencers:', error);
    return {
      success: false,
      influencers: [],
      pagination: {
        page: 1,
        page_size: pageSize,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      },
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get all campaign influencers without pagination (for status-based filtering)
 * @param campaign_list_id The campaign list ID
 * @returns Response with all campaign influencers
 */
export async function getAllCampaignInfluencers(
  campaign_list_id: string
): Promise<CampaignInfluencersResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: '1',
      page_size: '1000', // Large number to get all
      list_id: campaign_list_id
    });

    const response = await apiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
    }>(`${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBERS('')}?${queryParams}`);

    if (response.error) {
      console.error('Error fetching all campaign influencers:', response.error);
      return { 
        success: false, 
        influencers: [],
        pagination: {
          page: 1,
          page_size: 1000,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_previous: false
        },
        message: response.error.message 
      };
    }

    return {
      success: true,
      influencers: response.data?.influencers || [],
      pagination: response.data?.pagination || {
        page: 1,
        page_size: 1000,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      }
    };
  } catch (error) {
    console.error('Unexpected error fetching all campaign influencers:', error);
    return {
      success: false,
      influencers: [],
      pagination: {
        page: 1,
        page_size: 1000,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      },
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Add an influencer to campaign list (migrated from addInfluencerToList)
 * @param campaign_list_id The campaign list ID
 * @param influencer The influencer to add
 * @param platformId The platform ID
 * @returns Response indicating success/failure
 */
export async function addInfluencerToCampaignList(
  campaign_list_id: string,
  influencer: Influencer,
  platformId: string,
): Promise<CampaignListMember> {
  try {
    // Transform the influencer data to match the expected API format
    const requestData: AddToCampaignListRequest = {
      campaign_list_id: campaign_list_id,
      platform_id: platformId,
      social_data: {
        id: influencer.id || '',
        username: influencer.username || '',
        name: influencer.name || influencer.username || '',
        profileImage: influencer.profileImage || '',
        followers: influencer.followers || '0',
        isVerified: influencer.isVerified || false,
        account_url: influencer.url || '',
        additional_metrics: Object.fromEntries(
          Object.entries(influencer).filter(
            ([, value]) =>
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean' ||
              value === null
          )
        )
      },
    };

    // Call the API using the unified API client
    const response = await apiClient.post<CampaignListMember>(
      ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_CREATE,
      requestData
    );

    // Handle errors
    if (response.error) {
      console.error('Error adding influencer to campaign list:', response.error);
      return { 
        success: false, 
        message: response.error.message 
      };
    }

    // Return the success response
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Unexpected error adding influencer to campaign list:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Remove a campaign influencer (migrated from removeInfluencerFromList)
 * @param campaignInfluencerId The influencer ID to remove
 * @returns Response indicating success/failure
 */
export async function removeCampaignInfluencer(
  campaignInfluencerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Call the API using the unified API client
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      `${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_DELETE(campaignInfluencerId)}`
    );

    // Handle errors
    if (response.error) {
      console.error('Error removing campaign influencer:', response.error);
      return { 
        success: false, 
        message: response.error.message 
      };
    }

    // Return the success response
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Unexpected error removing campaign influencer:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Check if an influencer is already in a campaign list
 * @param campaign_list_id The campaign list ID
 * @param influencerId The influencer ID to check
 * @returns Boolean indicating if the influencer is in the list
 */
export async function checkInfluencerInCampaignList(
  campaign_list_id: string,
  influencerId: string
): Promise<boolean> {
  try {
    // Call the API using the unified API client
    const response = await apiClient.get<{ exists: boolean }>(
      `/api/v0/campaign-list-members/${campaign_list_id}/${influencerId}/check`
    );

    // Handle errors
    if (response.error) {
      console.error('Error checking if influencer is in campaign list:', response.error);
      return false;
    }

    // Return whether the influencer exists in the list
    return response.data?.exists || false;
  } catch (error) {
    console.error('Unexpected error checking if influencer is in campaign list:', error);
    return false;
  }
}