// src/app/api/shared-reports/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface SharedReportData {
  id: string;
  shareId: string;
  campaignId: string;
  campaignName: string;
  analyticsData: any;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Global storage that persists across requests
// In production, this should be a database
if (!(globalThis as any).sharedReportsStore) {
  (globalThis as any).sharedReportsStore = new Map<string, SharedReportData>();
  
  // Add test data
  const testReport: SharedReportData = {
    id: 'test_report_1',
    shareId: 'test-share-123',
    campaignId: 'test-campaign',
    campaignName: 'Test Campaign',
    analyticsData: {
      totalClicks: 12345,
      totalImpressions: 67890,
      totalReach: 44100,
      totalLikes: 2540,
      totalComments: 320,
      totalViews: 15600,
      totalPlays: 8900,
      totalFollowers: 240000,
      totalPosts: 5,
      totalInfluencers: 3,
      averageEngagementRate: 4.2,
      topPerformers: [
        {
          name: "Test Influencer",
          username: "testuser",
          avatar: "/user/profile-placeholder.png",
          clicks: 850,
          isVerified: true,
          totalPosts: 2,
          totalLikes: 1200,
          totalComments: 85,
          avgEngagementRate: 5.8,
          totalEngagement: 1285
        }
      ],
      topPosts: [
        {
          id: "test-post-1",
          influencerName: "Test Influencer",
          username: "testuser",
          avatar: "/user/profile-placeholder.png",
          thumbnail: "/dummy-image.jpg",
          likes: 850,
          comments: 42,
          views: 4500,
          plays: 2800,
          engagementRate: 5.8,
          isVerified: true,
          postId: "TEST123",
          totalEngagement: 892
        }
      ]
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  };
  
  (globalThis as any).sharedReportsStore.set('test-share-123', testReport);
  console.log('🔧 Initialized global shared reports store with test data');
}

const sharedReports: Map<string, SharedReportData> = (globalThis as any).sharedReportsStore;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('shareId');
  
  console.log(`📥 GET /api/shared-reports - shareId: ${shareId}`);
  console.log(`📊 Available reports: ${Array.from(sharedReports.keys()).join(', ')}`);
  
  // If shareId is provided, return specific report
  if (shareId) {
    return getSpecificReport(shareId, request);
  }
  
  // Otherwise, list all reports
  return listAllReports(request);
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/shared-reports - Creating new shared report');
    
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    const {
      shareId,
      campaignId,
      campaignName,
      analyticsData,
      createdAt,
      expiresAt
    } = body;

    // Validate required fields
    if (!shareId || !campaignId || !campaignName || !analyticsData) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: shareId, campaignId, campaignName, analyticsData' },
        { status: 400 }
      );
    }

    // Check if shareId already exists
    if (sharedReports.has(shareId)) {
      console.error('❌ Share ID already exists:', shareId);
      return NextResponse.json(
        { error: 'Share ID already exists' },
        { status: 409 }
      );
    }

    // Create shared report record
    const sharedReport: SharedReportData = {
      id: `report_${Date.now()}`,
      shareId,
      campaignId,
      campaignName,
      analyticsData,
      createdAt: createdAt || new Date().toISOString(),
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    };

    // Store in global memory
    sharedReports.set(shareId, sharedReport);

    console.log(`✅ Created shared report: ${shareId}`);
    console.log('📊 Total reports now:', sharedReports.size);

    const baseUrl = request.nextUrl.origin;
    const shareUrl = `${baseUrl}/campaign-analytics-report/${shareId}`;

    console.log('🔗 Generated share URL:', shareUrl);

    return NextResponse.json({
      success: true,
      data: {
        shareId: sharedReport.shareId,
        shareUrl,
        expiresAt: sharedReport.expiresAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Error creating shared report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getSpecificReport(shareId: string, request: NextRequest) {
  try {
    console.log(`🔍 Looking for shared report: ${shareId}`);

    const sharedReport = sharedReports.get(shareId);

    if (!sharedReport) {
      console.log(`❌ Shared report not found: ${shareId}`);
      return NextResponse.json(
        { error: 'Shared report not found' },
        { status: 404 }
      );
    }

    if (!sharedReport.isActive) {
      console.log(`🚫 Shared report deactivated: ${shareId}`);
      return NextResponse.json(
        { error: 'Shared report has been deactivated' },
        { status: 410 }
      );
    }

    // Check if report has expired
    const now = new Date();
    const expirationDate = new Date(sharedReport.expiresAt);
    
    if (now > expirationDate) {
      console.log(`⏰ Shared report expired: ${shareId}`);
      
      // Mark as inactive
      sharedReport.isActive = false;
      sharedReports.set(shareId, sharedReport);

      return NextResponse.json(
        { error: 'Shared report has expired' },
        { status: 410 }
      );
    }

    console.log(`✅ Successfully found shared report: ${shareId}`);

    return NextResponse.json({
      success: true,
      data: {
        shareId: sharedReport.shareId,
        campaignId: sharedReport.campaignId,
        campaignName: sharedReport.campaignName,
        analyticsData: sharedReport.analyticsData,
        createdAt: sharedReport.createdAt,
        expiresAt: sharedReport.expiresAt
      }
    });

  } catch (error) {
    console.error('💥 Error fetching shared report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function listAllReports(request: NextRequest) {
  try {
    console.log('📋 Listing all shared reports');
    
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (campaignId) {
      const campaignReports = Array.from(sharedReports.values())
        .filter(report => report.campaignId === campaignId && report.isActive);
      
      console.log(`📊 Found ${campaignReports.length} reports for campaign: ${campaignId}`);
      
      const baseUrl = request.nextUrl.origin;
      
      return NextResponse.json({
        success: true,
        data: campaignReports.map(report => ({
          shareId: report.shareId,
          campaignName: report.campaignName,
          createdAt: report.createdAt,
          expiresAt: report.expiresAt,
          shareUrl: `${baseUrl}/campaign-analytics-report/${report.shareId}`
        }))
      });
    }

    const allReports = Array.from(sharedReports.values())
      .filter(report => report.isActive);
    
    console.log(`📊 Found ${allReports.length} total active reports`);
    
    const baseUrl = request.nextUrl.origin;

    return NextResponse.json({
      success: true,
      data: allReports.map(report => ({
        shareId: report.shareId,
        campaignName: report.campaignName,
        createdAt: report.createdAt,
        expiresAt: report.expiresAt,
        shareUrl: `${baseUrl}/campaign-analytics-report/${report.shareId}`
      }))
    });

  } catch (error) {
    console.error('💥 Error listing shared reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}