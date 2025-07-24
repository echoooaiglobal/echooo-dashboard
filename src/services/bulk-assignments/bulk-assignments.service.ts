// src/services/bulk-assignments/bulk-assignments.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  BulkAssignmentRequest, 
  BulkAssignmentResponse 
} from '@/types/bulk-assignments';

/**
 * Execute bulk assignments via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function executeBulkAssignments(
  assignmentData: BulkAssignmentRequest
): Promise<BulkAssignmentResponse> {
  try {
    console.log('🚀 Client Service: Starting executeBulkAssignments call');
    console.log('📋 Client Service: Assignment data:', assignmentData);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('executeBulkAssignments can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Validate required fields client-side
    if (!assignmentData.campaign_list_id) {
      throw new Error('campaign_list_id is required');
    }
    
    if (!assignmentData.strategy) {
      throw new Error('strategy is required');
    }
    
    if (!assignmentData.max_influencers_per_agent || assignmentData.max_influencers_per_agent <= 0) {
      throw new Error('max_influencers_per_agent must be greater than 0');
    }
    
    const endpoint = '/api/v0/bulk-assignments/execute';
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.post<BulkAssignmentResponse>(
      endpoint, 
      assignmentData
    );
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Client Service: API Error:', response.error);
      throw new Error(response.error.message || 'Failed to execute bulk assignments');
    }
    
    if (!response.data) {
      console.error('❌ Client Service: No data received');
      throw new Error('No data received from server');
    }
    
    if (!response.data.success) {
      console.error('❌ Client Service: Bulk assignment failed:', response.data);
      throw new Error(response.data.message || 'Bulk assignment execution failed');
    }
    
    console.log('✅ Client Service: Bulk assignments executed successfully:', {
      totalInfluencers: response.data.total_influencers,
      totalAgents: response.data.total_agents,
      assignmentsCreated: response.data.assignments_created
    });
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: executeBulkAssignments failed:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred while executing bulk assignments');
  }
}

/**
 * Helper function to validate assignment data before sending
 */
export function validateBulkAssignmentData(data: Partial<BulkAssignmentRequest>): string[] {
  const errors: string[] = [];
  
  if (!data.campaign_list_id) {
    errors.push('Campaign list ID is required');
  }
  
  if (!data.strategy) {
    errors.push('Assignment strategy is required');
  } else if (!['round_robin', 'random', 'equal_distribution'].includes(data.strategy)) {
    errors.push('Invalid assignment strategy. Must be: round_robin, random, or equal_distribution');
  }
  
  if (!data.max_influencers_per_agent || data.max_influencers_per_agent <= 0) {
    errors.push('Max influencers per agent must be greater than 0');
  }
  
  if (data.preferred_agent_ids && !Array.isArray(data.preferred_agent_ids)) {
    errors.push('Preferred agent IDs must be an array');
  }
  
  return errors;
}