// src/services/campaign-influencers/campaign-influencers.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  CampaignListMember, 
  UpdateCampaignInfluencerRequest,
  CampaignInfluencersResponse,
  AddToCampaignListRequest,
  PaginationInfo,
  MarkOnboardedRequest,
  MarkOnboardedResponse,
  RemoveOnboardedRequest,
  RemoveOnboardedResponse
} from '@/types/campaign-influencers';
import { Influencer } from '@/types/insights-iq';

/**
 * Update campaign list member from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function updateCampaignInfluencerServer(
  id: string,
  updateData: UpdateCampaignInfluencerRequest,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE(id);
    
    const response = await serverApiClient.put<CampaignListMember>(
      endpoint,
      updateData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating campaign list member:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No campaign list member data received from FastAPI');
      throw new Error('No campaign list member data received');
    }
    
    console.log('Server: Campaign list member updated successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`Server: Error updating campaign list member ${id}:`, error);
    throw error;
  }
}

/**
 * Update campaign influencer status from FastAPI backend (server-side)
 */
export async function updateCampaignInfluencerStatusServer(
  id: string,
  assignedInfluencerId: string,
  statusId: string,
  authToken?: string
): Promise<{ success: boolean; message: string; influencer_id: string }> {
  try {
    console.log(`🔄 Server: Updating campaign influencer status ${id} to ${statusId}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_STATUS(id);
    
    const response = await serverApiClient.patch<{
      success: boolean;
      message: string;
      influencer_id: string;
    }>(
      endpoint,
      {assigned_influencer_id: assignedInfluencerId, status_id: statusId },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating campaign influencer status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('Server: Status update failed from FastAPI');
      throw new Error('Failed to update status');
    }
    
    console.log('✅ Server: Campaign influencer status updated successfully:', response.data.influencer_id);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error updating campaign influencer status ${id}:`, error);
    throw error;
  }
}

/**
 * Update campaign influencer price and currency from FastAPI backend (server-side)
 */
export async function updateCampaignInfluencerPriceServer(
  id: string,
  price: number | null,
  currency: string = 'USD',
  authToken?: string
): Promise<{ success: boolean; message: string; influencer_id: string }> {
  try {
    console.log(`🔄 Server: Updating campaign influencer price ${id} to ${price} ${currency}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_PRICE(id);
    
    const response = await serverApiClient.patch<{
      success: boolean;
      message: string;
      influencer_id: string;
    }>(
      endpoint,
      { 
        collaboration_price: price,
        currency: currency
      },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating campaign influencer price:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('Server: Price update failed from FastAPI');
      throw new Error('Failed to update price');
    }
    
    console.log('✅ Server: Campaign influencer price updated successfully:', response.data.influencer_id);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error updating campaign influencer price ${id}:`, error);
    throw error;
  }
}

/**
 * Get campaign list member by ID from FastAPI backend (server-side)
 */
export async function getCampaignInfluencerServer(
  id: string,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    console.log(`Server: Fetching campaign list member ${id}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.DETAIL(id);
    
    const response = await serverApiClient.get<CampaignListMember>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching campaign list member:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No campaign list member data received from FastAPI');
      throw new Error('No campaign list member data received');
    }
    
    console.log('Server: Campaign list member fetched successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching campaign list member ${id}:`, error);
    throw error;
  }
}

/**
 * Mark influencers as onboarded from FastAPI backend (server-side)
 */
export async function markInfluencersOnboardedServer(
  requestData: MarkOnboardedRequest,
  authToken?: string
): Promise<MarkOnboardedResponse> {
  try {
    console.log('🔄 Server: Marking influencers as onboarded:', requestData);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.MARK_ONBOARDED;
    
    const response = await serverApiClient.patch<MarkOnboardedResponse>(
      endpoint,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error marking influencers as onboarded:', response.error);
      throw new Error(response.error.message);
    }
    
    // Check if response.data exists and handle both success and error cases
    if (!response.data) {
      console.warn('⚠️ Server: No response data from FastAPI for mark onboarded');
      throw new Error('No response data received from server');
    }

    // Log the actual response to debug
    console.log('📊 Server: FastAPI Response for mark onboarded:', response.data);
    
    // Return the response as-is since FastAPI should return the correct format
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error marking influencers as onboarded:', error);
    throw error;
  }
}

/**
 * Remove onboarded influencers from FastAPI backend (server-side)
 */
export async function removeOnboardedInfluencersServer(
  requestData: RemoveOnboardedRequest,
  authToken?: string
): Promise<RemoveOnboardedResponse> {
  try {
    console.log('🔄 Server: Removing onboarded influencers:', requestData);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.REMOVE_ONBOARDED;
    
    const response = await serverApiClient.patch<RemoveOnboardedResponse>(
      endpoint,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error removing onboarded influencers:', response.error);
      throw new Error(response.error.message);
    }
    
    // Check if response.data exists and handle both success and error cases
    if (!response.data) {
      console.warn('⚠️ Server: No response data from FastAPI for remove onboarded');
      throw new Error('No response data received from server');
    }

    // Log the actual response to debug
    console.log('📊 Server: FastAPI Response for remove onboarded:', response.data);
    
    // Return the response as-is since FastAPI should return the correct format
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error removing onboarded influencers:', error);
    throw error;
  }
}


// ============ MIGRATED SERVER FUNCTIONS ============

/**
 * Get paginated campaign influencers from FastAPI backend (server-side)
 */
export async function getCampaignInfluencersServer(
  campaign_list_id: string,
  page: number = 1,
  pageSize: number = 10,
  authToken?: string
): Promise<CampaignInfluencersResponse> {
  try {
    console.log(`Server: Fetching campaign influencers for list ${campaign_list_id}, page ${page}, size ${pageSize}`);
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      list_id: campaign_list_id
    });

    const endpoint = `${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBERS('')}?${queryParams}`;
    
    const response = await serverApiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
    }>(endpoint, {}, authToken);
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching campaign influencers:', response.error);
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
    
    console.log(`✅ Server: Successfully fetched ${response.data?.influencers?.length || 0} campaign influencers`);
    
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
    console.error(`💥 Server: Error fetching campaign influencers for list ${campaign_list_id}:`, error);
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
 * Get all campaign influencers from FastAPI backend (server-side)
 */
export async function getAllCampaignInfluencersServer(
  campaign_list_id: string,
  authToken?: string
): Promise<CampaignInfluencersResponse> {
  try {
    console.log(`Server: Fetching all campaign influencers for list ${campaign_list_id}`);
    
    const queryParams = new URLSearchParams({
      page: '1',
      page_size: '1000', // Large number to get all
      list_id: campaign_list_id
    });

    const endpoint = `${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBERS('')}?${queryParams}`;
    
    const response = await serverApiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
    }>(endpoint, {}, authToken);
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching all campaign influencers:', response.error);
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
    
    console.log(`✅ Server: Successfully fetched all ${response.data?.influencers?.length || 0} campaign influencers`);
    
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
    console.error(`💥 Server: Error fetching all campaign influencers for list ${campaign_list_id}:`, error);
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
 * Add influencer to campaign list from FastAPI backend (server-side)
 */
export async function addInfluencerToCampaignListServer(
  campaign_list_id: string,
  influencer: Influencer,
  platformId: string,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    console.log(`Server: Adding influencer to campaign list ${campaign_list_id}`);
    
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

    const endpoint = ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_CREATE;
    
    const response = await serverApiClient.post<CampaignListMember>(
      endpoint,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error adding influencer to campaign list:', response.error);
      return { 
        success: false, 
        message: response.error.message 
      };
    }
    
    console.log('✅ Server: Influencer added to campaign list successfully');
    
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error(`💥 Server: Error adding influencer to campaign list ${campaign_list_id}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Remove campaign influencer from FastAPI backend (server-side)
 */
export async function removeCampaignInfluencerServer(
  campaignInfluencerId: string,
  authToken?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`Server: Removing campaign influencer ${campaignInfluencerId}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_DELETE(campaignInfluencerId);
    
    const response = await serverApiClient.delete<{ success: boolean; message?: string }>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error removing campaign influencer:', response.error);
      return { 
        success: false, 
        message: response.error.message 
      };
    }
    
    console.log('✅ Server: Campaign influencer removed successfully');
    
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error(`💥 Server: Error removing campaign influencer ${campaignInfluencerId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Check if influencer exists in campaign list from FastAPI backend (server-side)
 */
export async function checkInfluencerInCampaignListServer(
  campaign_list_id: string,
  influencerId: string,
  authToken?: string
): Promise<boolean> {
  try {
    console.log(`Server: Checking if influencer ${influencerId} exists in campaign list ${campaign_list_id}`);
    
    const endpoint = `/api/v0/campaign-list-members/${campaign_list_id}/${influencerId}/check`;
    
    const response = await serverApiClient.get<{ exists: boolean }>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error checking influencer in campaign list:', response.error);
      return false;
    }
    
    const exists = response.data?.exists || false;
    console.log(`✅ Server: Influencer exists check result: ${exists}`);
    
    return exists;
  } catch (error) {
    console.error(`💥 Server: Error checking influencer in campaign list:`, error);
    return false;
  }
}