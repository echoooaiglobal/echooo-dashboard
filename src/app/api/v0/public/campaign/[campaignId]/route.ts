// src/app/api/v0/public/campaign/[campaignId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getVideoResultsServer } from '@/services/video-results/video-results.server';

/**
 * GET /api/v0/public/campaign/[campaignId]
 * Get video results for a specific campaign - PUBLIC ACCESS (no auth required)
 * This endpoint is designed for shared campaign analytics reports
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    
    console.log(`Public API Route: GET /api/v0/public/campaign/${campaignId} called`);
    
    if (!campaignId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '200');
    
    // For public access, we'll use a system/service account token
    // or make an unauthenticated call if your backend supports it
    // You may need to adjust this based on your backend requirements
    
    console.log('Public API Route: Calling FastAPI backend without authentication...');
    
    let videoResults;
    
    try {
      // Option 1: Try without authentication first
      videoResults = await getVideoResultsServer(campaignId, page, limit, null);
    } catch (authError) {
      console.log('Public API Route: Backend requires authentication, trying with system token...');
      
      // Option 2: Use a system/service account token for public access
      // You'll need to set this environment variable with a service account token
      const systemToken = process.env.SYSTEM_SERVICE_TOKEN;
      
      if (systemToken) {
        try {
          videoResults = await getVideoResultsServer(campaignId, page, limit, systemToken);
        } catch (systemTokenError) {
          console.error('Public API Route: System token failed:', systemTokenError);
          throw new Error('Unable to access campaign data for public sharing');
        }
      } else {
        console.error('Public API Route: No system token configured');
        throw new Error('Public access not properly configured');
      }
    }
    
    console.log(`Public API Route: Successfully fetched video results for campaign ${campaignId}`);
    
    // Transform the backend response to match our expected format
    const transformedResponse = {
      success: true,
      results: videoResults.results || [],
      total: videoResults.total || videoResults.results?.length || 0,
      page: page,
      limit: limit,
      // Add metadata for public sharing
      isPublicAccess: true,
      accessTimestamp: new Date().toISOString()
    };
    
    // Set CORS headers for public access
    const response = NextResponse.json(transformedResponse);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
    
  } catch (error) {
    console.error('Public API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message,
          isPublicAccess: true
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch campaign analytics data for public sharing',
        isPublicAccess: true
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}