// src/services/campaign/campaign-list.service.ts

import { apiClient } from '@/lib/api'; // Import the unified API client
import { ENDPOINTS } from '@/services/api/endpoints';
import { DiscoverInfluencer } from '@/lib/types';
import { Influencer } from '@/types/insights-iq';
// Define the campaign list ID type
export type CampaignListId = string;

// Define the request body for adding an influencer to a list
export interface AddToListRequest {
  campaign_list_id: CampaignListId;
  platform_id: string;
  social_data: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    followers: string;
    isVerified?: boolean;
    account_url?: string;
    additional_metrics?: Record<string, string | number | boolean | null>;
  };
}

export interface Platform {
  id: string;
  name: string;
  logo_url: string;
}
// Define the response from the add to list API
export interface CampaignListMember {
  success: boolean;
  message?: string;
  id?: string;
  campaign_list_id?: string;
  social_account_id?: string;
  platform_id?: string;
  status_id?: string;
  contact_attempts?: number;
  next_contact_at?: string | null;
  collaboration_price?: number | null;
  last_contacted_at?: string | null;
  responded_at?: string | null;
  onboarded_at?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: {
    id: string;
    name: string;
  };
  platform?: {
    id: string;
    name: string;
  };
  username?: string;
  name?: string;
  profileImage?: string;
  followers?: string;
  isVerified?: boolean;
  engagement_rate?: number;
  avg_likes?: number;
  avg_comments?: number;
  social_account?: {
    id: string;
    account_handle: string;
    full_name: string;
    profile_pic_url: string;
    platform_id: string;
    is_verified: boolean;
    followers_count: number;
    platform_account_id: string;
    is_private: boolean;
    is_business: boolean;
    media_count?: number | null;
    following_count?: number | null;
    subscribers_count?: number | null;
    likes_count?: number | null;
    account_url?: string;
    platform?: Platform;
    additional_metrics?: {
      id?: string;
      url?: string;
      name?: string;
      gender?: string | null;
      language?: string | null;
      username?: string;
      age_group?: string;
      followers?: string;
      isVerified?: boolean;
      engagements?: string | number;
      external_id?: string;
      introduction?: string;
      profileImage?: string;
      average_likes?: number;
      average_views?: number | null;
      content_count?: number | null;
      engagementRate?: number;
      subscriber_count?: number | null;
      livestream_metrics?: any;
      platform_account_type?: string;
    };
  };
}


export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CampaignListMembersResponse {
  success: boolean;
  influencers: CampaignListMember[];
  pagination: PaginationInfo;
  message?: string;
}


/**
 * Add an influencer to a campaign list
 * @param campaign_list_id The campaign list ID
 * @param influencer The influencer to add
 * @returns Response indicating success/failure
 */
export async function addInfluencerToList(
  campaign_list_id: CampaignListId,
  influencer: Influencer,
  platformId: string,
): Promise<CampaignListMember> {
  try {
    // Transform the influencer data to match the expected API format
    const requestData: AddToListRequest = {
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
      console.error('Error adding influencer to list:', response.error);
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
    console.error('Unexpected error adding influencer to list:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get paginated members of a campaign list
 * @param campaign_list_id The campaign list ID
 * @param page Page number (1-based)
 * @param pageSize Items per page
 * @returns Response with paginated list members
 */
export async function getCampaignListMembers(
  campaign_list_id: CampaignListId,
  page: number = 1,
  pageSize: number = 10
): Promise<CampaignListMembersResponse> {
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
      console.error('Error fetching paginated campaign list members:', response.error);
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
    console.error('Unexpected error fetching paginated campaign list members:', error);
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
 * Remove an influencer from a campaign list
 * @param campaignInfluencerId The influencer ID to remove
 * @returns Response indicating success/failure
 */
export async function removeInfluencerFromList(
  campaignInfluencerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Call the API using the unified API client
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      `${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_DELETE(campaignInfluencerId)}`
    );

    // Handle errors
    if (response.error) {
      console.error('Error removing influencer from list:', response.error);
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
    console.error('Unexpected error removing influencer from list:', error);
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
export async function checkInfluencerInList(
  campaign_list_id: CampaignListId,
  influencerId: string
): Promise<boolean> {
  try {
    // Call the API using the unified API client
    const response = await apiClient.get<{ exists: boolean }>(
      `/api/v0/campaign-list-members/${campaign_list_id}/${influencerId}/check`
    );

    // Handle errors
    if (response.error) {
      console.error('Error checking if influencer is in list:', response.error);
      return false;
    }

    // Return whether the influencer exists in the list
    return response.data?.exists || false;
  } catch (error) {
    console.error('Unexpected error checking if influencer is in list:', error);
    return false;
  }
  
}