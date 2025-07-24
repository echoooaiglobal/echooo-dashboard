// src/services/campaign-influencers/campaign-influencers.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  CampaignListMember, 
  UpdateCampaignInfluencerRequest 
} from '@/types/campaign-influencers';

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