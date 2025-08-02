// src/app/api/v0/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getCurrentUserServer, updateCurrentUserServer } from '@/services/users/users.server';
import { UpdateUserRequest } from '@/types/users';

/**
 * GET /api/v0/auth/me
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📥 API Route: GET /api/v0/auth/me called');
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('🔑 API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    console.log('🚀 API Route: Calling FastAPI backend...');
    
    // Call FastAPI backend through server-side service with auth token
    const user = await getCurrentUserServer(authToken);
    
    console.log('✅ API Route: Successfully fetched current user');
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch current user' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v0/auth/me
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('📥 API Route: PUT /api/v0/auth/me called');
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('🔑 API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const updateData: UpdateUserRequest = await request.json();
    console.log('📝 API Route: Update data received:', {
      hasFirstName: !!updateData.first_name,
      hasLastName: !!updateData.last_name,
      hasPhoneNumber: !!updateData.phone_number,
      hasProfileImage: !!updateData.profile_image_url,
      fields: Object.keys(updateData)
    });

    // Basic validation
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Update data is required' 
        },
        { status: 400 }
      );
    }

    console.log('🚀 API Route: Calling FastAPI backend...');
    
    // Call FastAPI backend through server-side service with auth token
    const updatedUser = await updateCurrentUserServer(updateData, authToken);
    
    console.log('✅ API Route: Successfully updated current user profile');
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update profile' 
      },
      { status: 500 }
    );
  }
}