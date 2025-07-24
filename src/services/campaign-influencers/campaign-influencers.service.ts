// src/services/campaign-influencers/campaign-influencers.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  CampaignListMember, 
  UpdateCampaignInfluencerRequest,
  UpdateCampaignInfluencerResponse 
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