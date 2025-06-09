// src/app/api/v0/assignments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentsServer } from '@/services/assignments/assignments.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/assignments
 * Get all assignments
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/v0/assignments called');
    
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

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const assignmentsData = await getAssignmentsServer(authToken);
    
    console.log(`API Route: Successfully fetched ${assignmentsData.assignments?.length || 0} assignments`);
    return NextResponse.json(assignmentsData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}