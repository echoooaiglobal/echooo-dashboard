// src/services/bulk-assignments/bulk-assignments.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  BulkAssignmentRequest, 
  BulkAssignmentResponse 
} from '@/types/bulk-assignments';

/**
 * Execute bulk assignments from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function executeBulkAssignmentsServer(
  assignmentData: BulkAssignmentRequest,
  authToken?: string
): Promise<BulkAssignmentResponse> {
  try {
    console.log('Server: Executing bulk assignments with data:', assignmentData);
    
    // Validate required fields
    if (!assignmentData.campaign_list_id) {
      throw new Error('campaign_list_id is required');
    }
    
    if (!assignmentData.strategy) {
      throw new Error('strategy is required');
    }
    
    if (!assignmentData.max_influencers_per_agent || assignmentData.max_influencers_per_agent <= 0) {
      throw new Error('max_influencers_per_agent must be greater than 0');
    }
    
    const response = await serverApiClient.post<BulkAssignmentResponse>(
      ENDPOINTS.BULK_ASSIGNMENTS.EXECUTE,
      assignmentData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error executing bulk assignments:', response.error);
      throw new Error(response.error.message || 'Failed to execute bulk assignments');
    }
    
    if (!response.data) {
      console.warn('Server: No bulk assignment data received from FastAPI');
      throw new Error('No bulk assignment data received');
    }
    
    console.log('Server: Bulk assignments executed successfully:', {
      totalInfluencers: response.data.total_influencers,
      totalAgents: response.data.total_agents,
      assignmentsCreated: response.data.assignments_created
    });
    
    return response.data;
  } catch (error) {
    console.error('Server: Error executing bulk assignments:', error);
    throw error;
  }
}