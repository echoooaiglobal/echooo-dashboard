// src/app/api/v0/campaign-influencers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { 
  updateCampaignInfluencerServer, 
  getCampaignInfluencerServer 
} from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { UpdateCampaignInfluencerRequest } from '@/types/campaign-influencers';

/**
 * GET /api/v0/campaign-influencers/[id]
 * Get campaign list member by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`API Route: GET /api/v0/campaign-influencers/${id} called`);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Member ID parameter is required' },
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

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const memberData = await getCampaignInfluencerServer(id, authToken);
    
    console.log(`API Route: Successfully fetched campaign list member ${id}`);
    return NextResponse.json(memberData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch campaign list member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v0/campaign-influencers/[id]
 * Update campaign influencer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`API Route: PATCH /api/v0/campaign-influencers/${id} called`);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Member ID parameter is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const updateData: UpdateCampaignInfluencerRequest = await request.json();
    console.log('API Route: Update data:', updateData);
    
    // Basic validation
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Update data is required' },
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

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const updatedMember = await updateCampaignInfluencerServer(id, updateData, authToken);
    
    console.log(`API Route: Successfully updated campaign list member ${id}`);
    return NextResponse.json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    console.error('API Route Error:', error);
    
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
        error: 'Failed to update campaign list member' 
      },
      { status: 500 }
    );
  }
}