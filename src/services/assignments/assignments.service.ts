// src/services/assignments/assignments.service.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { AgentAssignmentsResponse } from '@/types/assignments';
import { AssignmentInfluencersResponse , AssignmentInfluencer} from '@/types/assignment-influencers';

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
 * Record a contact attempt for a campaign influencer
 */
export async function recordContactAttempt(assignedinfluencerId: string): Promise<ContactAttemptResponse> {
  try {
    const endpoint = `/api/v0/assigned-influencers/${assignedinfluencerId}/record-contact`;
    
    const response = await nextjsApiClient.post<ContactAttemptResponse>(endpoint, {});
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from contact attempt API');
    }
    
    console.log('✅ Client Service: Contact attempt recorded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error recording contact attempt:', error);
    
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

export async function getAgentAssignments(): Promise<AgentAssignmentsResponse> {
  try {
    console.log('🚀 Client Service: Starting getAgentAssignments call');
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getAgentAssignments can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('📞 Client Service: Making API call to /api/v0/agent-assignments');
    
    const response = await nextjsApiClient.get<AgentAssignmentsResponse>('/api/v0/agent-assignments');
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      response
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No agent assignments data received');
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
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.assignments?.length || 0} agent assignments`);
    console.log('📊 Client Service: Full response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getAgentAssignments:', error);
    
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

export async function getAssignmentInfluencers(
  assignmentId: string,
  page: number = 1,
  pageSize: number = 10,
  type?: 'active' | 'archived' | 'completed'
): Promise<AssignmentInfluencersResponse> {
  try {
    console.log(`🚀 Client Service: Starting getAssignmentInfluencers call for assignment ${assignmentId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getAssignmentInfluencers can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });
    
    if (type) {
      queryParams.append('type', type);
    }
    
    const endpoint = `/api/v0/assigned-influencers/agent-assignment/${assignmentId}?${queryParams}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<AssignmentInfluencersResponse>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      influencerCount: response.data?.influencers?.length || 0
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No assignment influencers data received');
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
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.influencers?.length || 0} assignment influencers`);
    console.log('📊 Client Service: Full response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getAssignmentInfluencers:', error);
    
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