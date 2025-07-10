// src/services/assignments/assignments.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { AssignmentsResponse, Assignment } from '@/types/assignments';
import { AssignmentMembersResponse } from '@/types/assignment-members';

/**
 * Get assignments from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getAssignmentsServer(authToken?: string): Promise<AssignmentsResponse> {
  try {
    console.log('Server: Fetching assignments from FastAPI');
    
    const response = await serverApiClient.get<AssignmentsResponse>(
      ENDPOINTS.ASSIGNMENTS.LIST,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching assignments:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No assignments data received from FastAPI');
      return {
        assignments: [],
        total_assignments: 0,
        agent_info: null
      };
    }
    
    console.log(`Server: Assignments fetched successfully: ${response.data.assignments?.length || 0} assignments`);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching assignments:', error);
    throw error;
  }
}

/**
 * Get assignment members from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getAssignmentMembersServer(
  assignmentId: string, 
  page: number = 1,
  pageSize: number = 10,
  authToken?: string
): Promise<AssignmentMembersResponse> {
  try {
    console.log(`Server: Fetching assignment members for assignment ${assignmentId}`);
    
    // Build query parameters for pagination
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });
    
    const endpoint = `${ENDPOINTS.ASSIGNMENTS.INFLUENCERS_LIST(assignmentId)}?${queryParams}`;
    
    const response = await serverApiClient.get<AssignmentMembersResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching assignment members:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No assignment members data received from FastAPI');
      return {
        members: [],
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
    
    console.log(`Server: Assignment members fetched successfully: ${response.data.members?.length || 0} members`);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching assignment members for ${assignmentId}:`, error);
    throw error;
  }
}