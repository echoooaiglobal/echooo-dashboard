// src/app/api/v0/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getUsersServer, getUserStatsServer } from '@/services/users/users.server';
import { UserSearchParams } from '@/types/users';

/**
 * GET /api/v0/users - Get all users with optional filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚀 API Route: GET /api/v0/users');
    
    // Get auth token from request
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Auth token found, proceeding with request');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params: UserSearchParams = {};
    
    const skip = searchParams.get('skip');
    const limit = searchParams.get('limit');
    const userType = searchParams.get('user_type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (skip) params.skip = parseInt(skip, 10);
    if (limit) params.limit = parseInt(limit, 10);
    if (userType) params.user_type = userType;
    if (status) params.status = status;
    if (search) params.search = search;

    console.log('📋 API Route: Search params:', params);

    // Call server service to get users from FastAPI
    const users = await getUsersServer(params, authToken);

    console.log(`✅ API Route: Successfully retrieved ${users.length} users`);
    return NextResponse.json({
      success: true,
      data: {
        users,
        total: users.length,
        skip: params.skip || 0,
        limit: params.limit || 100
      }
    });

  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/users:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to get users';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v0/users - Create new user (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚀 API Route: POST /api/v0/users');
    
    // Get auth token from request
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Auth token found, proceeding with request');

    // Parse request body
    let userData;
    try {
      userData = await request.json();
      console.log('📋 API Route: Parsed user data:', userData);
    } catch (error) {
      console.error('❌ API Route: Failed to parse request body:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Call FastAPI create user endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const newUser = await response.json();

    console.log('✅ API Route: Successfully created user');
    return NextResponse.json({
      success: true,
      data: newUser
    });

  } catch (error) {
    console.error('💥 API Route: Error in POST /api/v0/users:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    const statusCode = errorMessage.includes('validation') || errorMessage.includes('Invalid') ? 400 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}