// src/services/assignments/assignments.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { AgentAssignmentsResponse } from '@/types/assignments';
import { AssignmentInfluencersResponse } from '@/types/assignment-influencers';
import { AssignmentInfluencer } from '@/types/assignment-influencers';

export interface ContactAttemptResponse {
  success: boolean;
  message: string;
  assigned_influencer: AssignmentInfluencer;
  next_template_info: {
    type: string;
    template_id: string;
    followup_sequence: number;
    delay_hours: number;
    subject: string;
    next_contact_at: string;
    message: string;
    initial_template_id: string;
    campaign_id: string;
  };
}


/**
 * Record a contact attempt for a campaign influencer (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function recordContactAttemptServer(
  assignedInfluencerId: string, 
  authToken?: string
): Promise<ContactAttemptResponse> {
  try {
    console.log(`Server: Recording contact attempt for influencer ${assignedInfluencerId}`);
    
    const response = await serverApiClient.post<ContactAttemptResponse>(
      ENDPOINTS.ASSIGNED_INFLUENCERS.RECORD_CONTACT_ATTEMPT(assignedInfluencerId),
      {}, // Empty body for POST request
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error recording contact attempt:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Contact attempt recorded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Server: Error recording contact attempt for influencer ${assignedInfluencerId}:`, error);
    throw error;
  }
}

export async function getAgentAssignmentsServer(authToken?: string): Promise<AgentAssignmentsResponse> {
  try {
    console.log('Server: Fetching agent assignments from FastAPI');
    
    const response = await serverApiClient.get<AgentAssignmentsResponse>(
      ENDPOINTS.ASSIGNMENTS.LIST,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching agent assignments:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No agent assignments data received from FastAPI');
      return {
        assignments: [],
        pagination: {
          page: 1,
          page_size: 100,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_previous: false
        }
      };
    }
    
    console.log(`Server: Agent assignments fetched successfully: ${response.data.assignments?.length || 0} assignments`);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching agent assignments:', error);
    throw error;
  }
}

export async function getAssignmentInfluencersServer(
  assignmentId: string, 
  page: number = 1,
  pageSize: number = 10,
  type?: 'active' | 'archived' | 'completed',
  authToken?: string
): Promise<AssignmentInfluencersResponse> {
  try {
    console.log(`Server: Fetching assignment influencers for assignment ${assignmentId}`);
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString()
    });
    
    if (type) {
      queryParams.append('type', type);
    }
    
    const endpoint = `${ENDPOINTS.ASSIGNMENTS.INFLUENCERS_LIST(assignmentId)}?${queryParams}`;
    
    const response = await serverApiClient.get<AssignmentInfluencersResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching assignment influencers:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No assignment influencers data received from FastAPI');
      return {
        influencers: [],
        pagination: {
          page: 1,
          page_size: pageSize,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_previous: false
        }
      };
    }
    
    console.log(`Server: Assignment influencers fetched successfully: ${response.data.influencers?.length || 0} influencers`);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching assignment influencers for ${assignmentId}:`, error);
    throw error;
  }
}