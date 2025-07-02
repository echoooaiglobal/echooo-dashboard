// src/app/api/shared-reports/route.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/shared-reports
 * Create a shared analytics report
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Shared Reports API: POST request received');
    
    const body = await request.json();
    const { shareId, campaignId, campaignName, analyticsData, createdAt, expiresAt } = body;
    
    console.log('📝 Creating shared report:', {
      shareId,
      campaignId,
      campaignName: campaignName?.substring(0, 50) + '...',
      hasAnalyticsData: !!analyticsData,
      createdAt,
      expiresAt
    });
    
    // Validate required fields
    if (!shareId || !campaignId || !campaignName || !analyticsData) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: shareId, campaignId, campaignName, or analyticsData' 
        },
        { status: 400 }
      );
    }
    
    // Here you would typically save this to a database
    // For now, we'll simulate success and generate the share URL
    
    // Generate the public share URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/campaign-analytics-report/${campaignId}`;
    
    console.log('🔗 Generated share URL:', shareUrl);
    
    // In a real implementation, you would:
    // 1. Save the shared report data to your database with the shareId
    // 2. Set up proper expiration handling
    // 3. Implement access controls and validation
    
    const responseData = {
      success: true,
      message: 'Shared report created successfully',
      data: {
        shareId,
        shareUrl,
        campaignId,
        campaignName,
        createdAt,
        expiresAt,
        isPublic: true
      }
    };
    
    console.log('✅ Shared report created successfully');
    
    return NextResponse.json(responseData, { status: 201 });
    
  } catch (error) {
    console.error('💥 Shared Reports API Error:', error);
    
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
        error: 'Failed to create shared report' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shared-reports/[shareId]
 * Retrieve a shared analytics report (optional, for future use)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    
    if (!shareId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Share ID is required' 
        },
        { status: 400 }
      );
    }
    
    console.log('🔍 Retrieving shared report:', shareId);
    
    // In a real implementation, you would:
    // 1. Query your database for the shared report by shareId
    // 2. Check if it's expired
    // 3. Return the analytics data if valid
    
    // For now, we'll return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'This endpoint is for future use. Reports are currently accessed directly via campaign ID.',
      data: null
    });
    
  } catch (error) {
    console.error('💥 Shared Reports GET API Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve shared report' 
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}