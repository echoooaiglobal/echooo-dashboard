// src/services/campaign-list-members/campaign-list-members.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  CampaignListMember, 
  UpdateCampaignListMemberRequest 
} from '@/types/campaign-list-members';

/**
 * Update campaign list member from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function updateCampaignListMemberServer(
  memberId: string,
  updateData: UpdateCampaignListMemberRequest,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    console.log(`Server: Updating campaign list member ${memberId}`);
    console.log('Server: Update data:', updateData);
    
    const endpoint = ENDPOINTS.CAMPAIGN_LIST_MEMBERS.UPDATE(memberId);
    
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
    console.error(`Server: Error updating campaign list member ${memberId}:`, error);
    throw error;
  }
}

/**
 * Get campaign list member by ID from FastAPI backend (server-side)
 */
export async function getCampaignListMemberServer(
  memberId: string,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    console.log(`Server: Fetching campaign list member ${memberId}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_LIST_MEMBERS.DETAIL(memberId);
    
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
    console.error(`Server: Error fetching campaign list member ${memberId}:`, error);
    throw error;
  }
}