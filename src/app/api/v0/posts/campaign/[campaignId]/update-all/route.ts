// src/app/api/v0/results/campaign/[campaignId]/update-all/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updateAllVideoResultsServer } from '@/services/video-results/video-results.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * POST /api/v0/results/campaign/[campaignId]/update-all
 * Update all video results for a specific campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    
    console.log(`API Route: POST /api/v0/results/campaign/${campaignId}/update-all called`);
    
    if (!campaignId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend to update all video results...');
    // Call FastAPI backend through server-side service with auth token
    const updatedResults = await updateAllVideoResultsServer(campaignId, authToken);
    
    console.log(`API Route: Successfully updated all video results for campaign ${campaignId}`);
    return NextResponse.json(updatedResults);
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
        error: 'Failed to update all video results' 
      },
      { status: 500 }
    );
  }
}