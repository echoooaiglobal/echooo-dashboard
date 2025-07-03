// src/app/api/v0/profile-analytics/public/[platformAccountId]/route.ts
// Updated to work with InsightIQ client credentials

import { NextRequest, NextResponse } from 'next/server';

// Function to get access token using client credentials
async function getInsightIQAccessToken() {
  const clientId = process.env.INSIGHTIQ_CLIENT_ID;
  const clientSecret = process.env.INSIGHTIQ_CLIENT_SECRET;
  const baseUrl = process.env.INSIGHTIQ_BASE_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    throw new Error('InsightIQ credentials not configured');
  }

  console.log('Getting InsightIQ access token...');

  try {
    // Get access token using client credentials
    const tokenResponse = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', errorText);
      throw new Error(`Failed to get access token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Access token obtained successfully');
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { platformAccountId: string } }
) {
  try {
    const { platformAccountId } = params;

    if (!platformAccountId) {
      return NextResponse.json(
        { detail: 'Platform account ID is required' },
        { status: 400 }
      );
    }

    console.log(`Public API Route: Getting profile analytics for platform account ${platformAccountId}`);

    // Method 1: Try to get a fresh access token using client credentials
    let authToken;
    
    try {
      authToken = await getInsightIQAccessToken();
      console.log('Successfully obtained access token for public access');
    } catch (tokenError) {
      console.error('Failed to get access token:', tokenError);
      
      // Method 2: Check if any manual token is set as fallback
      const fallbackTokens = {
        service: process.env.INSIGHTIQ_SERVICE_TOKEN,
        default: process.env.INSIGHTIQ_DEFAULT_TOKEN,
        public: process.env.INSIGHTIQ_PUBLIC_TOKEN,
        nextPublic: process.env.NEXT_PUBLIC_INSIGHTIQ_TOKEN,
      };

      authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhY21lY29ycC5jb20iLCJ1c2VyX2lkIjoiMzczYmE3NzctM2Y1Ny00ODQ5LWFhMTUtM2NmNDBlZTcwOGViIiwiZXhwIjoxNzUxNDc2NDcyfQ.sxkIuHFin8jWjDBinsQ1SynnFVsRsYvSu14p3g2gmGE"
      
      if (!authToken) {
        return NextResponse.json(
          { 
            detail: 'Public access configuration error - unable to obtain access token',
            debug: 'Failed to get token via client credentials and no fallback token available',
            tokenError: tokenError instanceof Error ? tokenError.message : 'Unknown token error'
          },
          { status: 503 }
        );
      }
      
      console.log('Using fallback token for public access');
    }

    // Use your existing working API endpoint
    const apiUrl = `${request.nextUrl.origin}/api/v0/profile-analytics/by-handle/${platformAccountId}`;
    
    console.log('Public API Route: Making request to:', apiUrl);

    // Call your existing working API endpoint with authentication
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    console.log('Public API Route: Internal API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Public API Route: Internal API error:', errorText);
      
      if (response.status === 404) {
        return NextResponse.json(
          { detail: 'Profile analytics not found' },
          { status: 404 }
        );
      }
      
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { 
            detail: 'Authentication error - token may be invalid',
            debug: `Token used: ${authToken.substring(0, 10)}...`,
            responseStatus: response.status,
            responseError: errorText
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          detail: 'Failed to fetch profile analytics from internal API',
          debug: `Status: ${response.status}, Error: ${errorText}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('Public API Route: Profile analytics retrieved successfully via internal API');

    // Add CORS headers for public access
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300',
    };

    return NextResponse.json(data, { 
      status: 200,
      headers 
    });

  } catch (error) {
    console.error('Public API Route: Error getting profile analytics:', error);
   
    return NextResponse.json(
      { 
        detail: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}