// src/app/api/shared-reports/[shareId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getVideoResultsServer } from '@/services/video-results/video-results.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface SharedReportData {
  id: string;
  shareId: string;
  campaignId: string;
  campaignName: string;
  analyticsData?: any; // Make optional since we fetch fresh data
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Use the same global storage as the main route
if (!(globalThis as any).sharedReportsStore) {
  (globalThis as any).sharedReportsStore = new Map<string, SharedReportData>();
  console.log('🔧 Initialized [shareId] route storage');
}

const sharedReports: Map<string, SharedReportData> = (globalThis as any).sharedReportsStore;

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId;

    console.log(`🔍 GET /api/shared-reports/${shareId}`);
    console.log(`📊 Available reports: ${Array.from(sharedReports.keys()).join(', ')}`);

    if (!shareId) {
      console.error('❌ Invalid or missing shareId');
      return NextResponse.json(
        { error: 'Invalid or missing shareId' },
        { status: 400 }
      );
    }

    // Get the shared report metadata
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

    console.log(`✅ Found shared report: ${shareId} for campaign: ${sharedReport.campaignId}`);

    // ALWAYS fetch fresh, real-time data from the campaign API
    // This ensures shared reports show the same live data as the campaign dashboard
    try {
      console.log(`🔄 Fetching LIVE campaign data for: ${sharedReport.campaignId}`);
      
      // Extract query parameters for pagination (get all data for analytics)
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '100'); // Get more data for better analytics
      
      // Extract Bearer token from request headers
      // For shared reports, we might need to handle auth differently
      // Since these are public links, we may need a service token or make this endpoint public
      const authToken = extractBearerToken(request);
      console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
      
      // If no token provided, we might need to use a service token for public access
      // You might want to configure this based on your security requirements
      if (!authToken) {
        console.log('⚠️ No Bearer token for shared report - this might need service token');
        // For now, we'll try without token - you may need to adjust this
      }

      console.log(`📤 Calling video results API for campaign: ${sharedReport.campaignId}`);
      
      // Use the EXACT same logic as your campaign endpoint
      const videoResults = await getVideoResultsServer(
        sharedReport.campaignId, 
        page, 
        limit, 
        authToken || '' // You might need to provide a service token here
      );
      
      console.log(`✅ Successfully fetched LIVE video results:`, {
        campaignId: sharedReport.campaignId,
        resultsCount: videoResults?.results?.length || 0,
        total: videoResults?.total || 0
      });
      
      // Transform the backend response to match our expected format (same as campaign endpoint)
      const campaignData = {
        success: true,
        results: videoResults.results || [],
        total: videoResults.total || videoResults.results?.length || 0,
        page: page,
        limit: limit
      };

      // Transform to analytics format
      const analyticsData = transformCampaignResultsToAnalytics(campaignData, sharedReport.campaignName);

      console.log(`📊 Transformed to analytics:`, {
        totalPosts: analyticsData.totalPosts,
        totalLikes: analyticsData.totalLikes,
        totalComments: analyticsData.totalComments,
        totalInfluencers: analyticsData.totalInfluencers
      });

      // Return the LIVE data (no caching for real-time updates)
      return NextResponse.json({
        success: true,
        data: {
          shareId: sharedReport.shareId,
          campaignId: sharedReport.campaignId,
          campaignName: sharedReport.campaignName,
          analyticsData: analyticsData,
          createdAt: sharedReport.createdAt,
          expiresAt: sharedReport.expiresAt,
          lastUpdated: new Date().toISOString() // Show when data was last fetched
        }
      });

    } catch (fetchError) {
      console.error('💥 Error fetching LIVE campaign data:', fetchError);
      
      // If the API fails, return an error instead of cached data
      // This ensures users know when data is unavailable
      return NextResponse.json(
        { 
          error: 'Unable to fetch live campaign data. Please try again later.',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
        },
        { status: 503 } // Service Unavailable
      );
    }

  } catch (error) {
    console.error('💥 Error in shared report endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to transform campaign results to analytics format
// This should match the transformation logic in your AnalyticsView component
function transformCampaignResultsToAnalytics(campaignResponse: any, campaignName: string) {
  console.log(`🔄 Transforming campaign results to analytics format`);
  
  const posts = campaignResponse.results || [];
  
  if (!Array.isArray(posts) || posts.length === 0) {
    console.log(`⚠️ No posts found in campaign results`);
    return {
      totalClicks: 0,
      totalImpressions: 0,
      totalReach: 0,
      totalLikes: 0,
      totalComments: 0,
      totalViews: 0,
      totalPlays: 0,
      totalFollowers: 0,
      totalPosts: 0,
      totalInfluencers: 0,
      averageEngagementRate: 0,
      topPerformers: [],
      topPosts: []
    };
  }

  // Group videos by influencer to ensure unique counting (same logic as AnalyticsView)
  const influencerGroups = new Map<string, any[]>();
  posts.forEach((video: any) => {
    const key = (video.influencer_username || 'unknown').toLowerCase();
    if (!influencerGroups.has(key)) {
      influencerGroups.set(key, []);
    }
    influencerGroups.get(key)!.push(video);
  });

  let totalLikes = 0;
  let totalComments = 0;
  let totalViews = 0;
  let totalPlays = 0;
  let totalFollowers = 0;
  let totalEngagementRates = 0;
  let validEngagementCount = 0;

  const influencerPerformanceData: any[] = [];
  const allPostsData: any[] = [];

  // Process each unique influencer (same logic as AnalyticsView)
  influencerGroups.forEach((videos, username) => {
    let influencerTotalLikes = 0;
    let influencerTotalComments = 0;
    let influencerTotalViews = 0;
    let influencerTotalPlays = 0;
    let influencerEngagementRates = 0;
    let influencerValidEngagements = 0;
    let influencerFollowers = 0;
    let influencerAvatar = '';
    let influencerName = '';
    let isVerified = false;

    videos.forEach((video: any) => {
      const postData = video.post_result_obj?.data;
      
      // Extract metrics (adjust field names based on your actual data structure)
      const likes = postData?.edge_media_preview_like?.count || 
                    postData?.edge_liked_by?.count || 
                    video.likes_count || 0;
      
      const comments = postData?.edge_media_to_comment?.count || 
                       postData?.edge_media_preview_comment?.count || 
                       video.comments_count || 0;
      
      const views = postData?.video_view_count || video.views_count || 0;
      const plays = postData?.video_play_count || video.plays_count || 0;
      const followers = postData?.owner?.edge_followed_by?.count || 0;
      
      // Accumulate totals
      totalLikes += likes;
      totalComments += comments;
      totalViews += views;
      totalPlays += plays;
      
      influencerTotalLikes += likes;
      influencerTotalComments += comments;
      influencerTotalViews += views;
      influencerTotalPlays += plays;
      
      const engagementRate = followers > 0 ? ((likes + comments) / followers) * 100 : 0;
      if (engagementRate > 0) {
        totalEngagementRates += engagementRate;
        validEngagementCount++;
        influencerEngagementRates += engagementRate;
        influencerValidEngagements++;
      }

      if (followers > influencerFollowers) {
        influencerFollowers = followers;
      }

      if (!influencerName || video.full_name) {
        influencerName = video.full_name || video.influencer_username || username;
        influencerAvatar = video.profile_pic_url || postData?.owner?.profile_pic_url || '/user/profile-placeholder.png';
        isVerified = postData?.owner?.is_verified || false;
      }

      // Add to posts data
      const totalEngagement = likes + comments;
      allPostsData.push({
        id: video.id || Math.random().toString(),
        influencerName: video.full_name || video.influencer_username || username,
        username: video.influencer_username || username,
        avatar: video.profile_pic_url || postData?.owner?.profile_pic_url || '/user/profile-placeholder.png',
        thumbnail: video.thumbnail || video.media_preview || 
                  postData?.display_resources?.[postData.display_resources.length - 1]?.src ||
                  postData?.thumbnail_src || '/dummy-image.jpg',
        likes,
        comments,
        views,
        plays,
        engagementRate,
        isVerified: postData?.owner?.is_verified || false,
        postId: postData?.shortcode || video.post_id || '',
        totalEngagement
      });
    });

    // Update total followers (take max, not sum)
    totalFollowers = Math.max(totalFollowers, influencerFollowers);

    // Calculate average engagement rate for this influencer
    const avgEngagementRate = influencerValidEngagements > 0 
      ? influencerEngagementRates / influencerValidEngagements 
      : 0;

    const influencerTotalEngagement = influencerTotalLikes + influencerTotalComments;
    const influencerClicks = Math.round(influencerTotalEngagement * 0.8);

    influencerPerformanceData.push({
      name: influencerName,
      username: username,
      avatar: influencerAvatar,
      clicks: influencerClicks,
      isVerified,
      totalPosts: videos.length,
      totalLikes: influencerTotalLikes,
      totalComments: influencerTotalComments,
      avgEngagementRate,
      totalEngagement: influencerTotalEngagement
    });
  });

  // Calculate final metrics
  const totalPosts = posts.length;
  const totalInfluencers = influencerGroups.size;
  const averageEngagementRate = validEngagementCount > 0 ? totalEngagementRates / validEngagementCount : 0;
  const totalClicks = Math.round((totalLikes + totalComments) * 0.7);
  const totalImpressions = Math.round(totalClicks * 15);
  const totalReach = Math.round(totalImpressions * 0.65);

  // Get top performers and posts
  const topPerformers = influencerPerformanceData
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 5);

  const topPosts = allPostsData
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 5);

  console.log(`✅ Analytics transformation complete:`, {
    totalPosts,
    totalInfluencers,
    totalLikes,
    totalComments,
    totalClicks,
    topPerformersCount: topPerformers.length,
    topPostsCount: topPosts.length
  });

  return {
    totalClicks,
    totalImpressions,
    totalReach,
    totalLikes,
    totalComments,
    totalViews,
    totalPlays,
    totalFollowers,
    totalPosts,
    totalInfluencers,
    averageEngagementRate,
    topPerformers,
    topPosts
  };
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId;


    console.log(`🗑️ DELETE /api/shared-reports/${shareId}`);

    if (!shareId) {
      return NextResponse.json(
        { error: 'Invalid or missing shareId' },
        { status: 400 }
      );
    }

    const sharedReport = sharedReports.get(shareId);

    if (!sharedReport) {
      return NextResponse.json(
        { error: 'Shared report not found' },
        { status: 404 }
      );
    }

    // Mark as inactive
    sharedReport.isActive = false;
    sharedReports.set(shareId, sharedReport);

    console.log(`✅ Deactivated shared report: ${shareId}`);

    return NextResponse.json({
      success: true,
      message: 'Shared report deactivated successfully'
    });

  } catch (error) {
    console.error('💥 Error deleting shared report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}