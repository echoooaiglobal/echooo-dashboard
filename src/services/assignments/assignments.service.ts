// src/services/assignments/assignments.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { AssignmentsResponse, Assignment } from '@/types/assignments';
import { AssignmentMembersResponse } from '@/types/assignment-members';

/**
 * Get assignments from Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function getAssignments(): Promise<AssignmentsResponse> {
  try {
    console.log('🚀 Client Service: Starting getAssignments call');
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getAssignments can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('📞 Client Service: Making API call to /api/v0/assignments');
    
    const response = await nextjsApiClient.get<AssignmentsResponse>('/api/v0/assignments');
    
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
      console.warn('⚠️ Client Service: No assignments data received');
      return {
        assignments: [],
        total_assignments: 0,
        agent_info: null
      };
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.assignments?.length || 0} assignments`);
    console.log('📊 Client Service: Full response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getAssignments:', error);
    
    // Enhanced error logging
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
 * Get assignment members from Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function getAssignmentMembers(
  assignmentId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<AssignmentMembersResponse> {
  try {
    console.log(`🚀 Client Service: Starting getAssignmentMembers call for assignment ${assignmentId}`);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getAssignmentMembers can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });
    
    const endpoint = `/api/v0/assignments/${assignmentId}/members?${queryParams}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<AssignmentMembersResponse>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      memberCount: response.data?.members?.length || 0
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No assignment members data received');
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
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.members?.length || 0} assignment members`);
    console.log('📊 Client Service: Full response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getAssignmentMembers:', error);
    
    // Enhanced error logging
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