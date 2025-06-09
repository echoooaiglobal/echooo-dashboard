// src/app/api/v0/assignments/[id]/members/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentMembersServer } from '@/services/assignments/assignments.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/assignments/[id]/members
 * Get assignment members by assignment ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: assignmentId } = params;
    
    console.log(`API Route: GET /api/v0/assignments/${assignmentId}/members called`);
    
    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    // Extract pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '10', 10);
    
    console.log(`API Route: Pagination params - page: ${page}, pageSize: ${pageSize}`);

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const assignmentMembersData = await getAssignmentMembersServer(
      assignmentId, 
      page, 
      pageSize, 
      authToken
    );
    
    console.log(`API Route: Successfully fetched ${assignmentMembersData.members?.length || 0} assignment members`);
    return NextResponse.json(assignmentMembersData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch assignment members' },
      { status: 500 }
    );
  }
}