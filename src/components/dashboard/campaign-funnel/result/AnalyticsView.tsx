// src/components/dashboard/campaign-funnel/result/AnalyticsView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getVideoResults } from '@/services/video-results';
import { VideoResult } from '@/types/user-detailed-info';
import { Campaign } from '@/types/campaign';
import { exportToPDF, exportToPrint, generateExportFilename } from '@/utils/pdfExportUtils';

interface AnalyticsData {
  totalClicks: number;
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalPlays: number;
  totalFollowers: number;
  totalPosts: number;
  totalInfluencers: number;
  averageEngagementRate: number;
  postsByDate: Array<{
    date: string;
    count: number;
  }>;
  topPerformers: Array<{
    name: string;
    username: string;
    avatar: string;
    clicks: number;
    isVerified: boolean;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    avgEngagementRate: number;
    totalEngagement: number;
    followers: number;
  }>;
  topPosts: Array<{
    id: string;
    influencerName: string;
    username: string;
    avatar: string;
    thumbnail: string;
    likes: number;
    comments: number;
    views: number;
    plays: number;
    shares: number;
    engagementRate: number;
    isVerified: boolean;
    postId: string;
    totalEngagement: number;
  }>;
}

interface AnalyticsViewProps {
  onBack: () => void;
  campaignData?: Campaign | null;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack, campaignData }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
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
    postsByDate: [],
    topPerformers: [],
    topPosts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  
  const exportContentRef = useRef<HTMLDivElement>(null);

  const getProxiedImageUrl = (originalUrl: string): string => {
    if (!originalUrl) return '/user/profile-placeholder.png';
    
    if (originalUrl.startsWith('/api/') || originalUrl.startsWith('/user/') || originalUrl.startsWith('data:')) {
      return originalUrl;
    }
    
    if (originalUrl.includes('instagram.com') || originalUrl.includes('fbcdn.net') || originalUrl.includes('cdninstagram.com')) {
      return `/api/v0/instagram/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    }
    
    return originalUrl;
  };

  const getPostData = (video: VideoResult) => {
    const postData = video.post_result_obj?.data;
    if (!postData) return {
      likes: video.likes_count || 0,
      comments: video.comments_count || 0,
      views: video.views_count || 0,
      plays: video.plays_count || 0,
      shares: Math.floor((video.likes_count || 0) * 0.1),
      followers: 0,
      engagementRate: 0,
      avatarUrl: getProxiedImageUrl(video.profile_pic_url || ''),
      isVerified: false,
      thumbnailUrl: getProxiedImageUrl(video.thumbnail || video.media_preview || '')
    };

    const likes = postData.edge_media_preview_like?.count || 
                  postData.edge_liked_by?.count || 
                  video.likes_count || 0;
    
    const comments = postData.edge_media_to_comment?.count || 
                     postData.edge_media_preview_comment?.count || 
                     postData.edge_media_to_parent_comment?.count ||
                     video.comments_count || 0;
    
    const views = postData.video_view_count || video.views_count || 0;
    const plays = postData.video_play_count || video.plays_count || 0;
    const shares = Math.floor(likes * 0.1); // Estimate shares as 10% of likes
    
    const followers = postData.owner?.edge_followed_by?.count || 0;
    const engagementRate = followers > 0 ? ((likes + comments) / followers) * 100 : 0;
    
    let avatarUrl = '/user/profile-placeholder.png';
    if (postData.owner?.profile_pic_url) {
      avatarUrl = postData.owner.profile_pic_url;
    } else if (video.profile_pic_url) {
      avatarUrl = video.profile_pic_url;
    }

    let thumbnailUrl = '/dummy-image.jpg';
    if (postData.display_resources && postData.display_resources.length > 0) {
      thumbnailUrl = postData.display_resources[postData.display_resources.length - 1].src;
    } else if (postData.thumbnail_src) {
      thumbnailUrl = postData.thumbnail_src;
    } else if (postData.display_url) {
      thumbnailUrl = postData.display_url;
    } else if (video.thumbnail) {
      thumbnailUrl = video.thumbnail;
    } else if (video.media_preview) {
      thumbnailUrl = video.media_preview;
    }
    
    return {
      likes,
      comments,
      views,
      plays,
      shares,
      followers,
      engagementRate,
      avatarUrl: getProxiedImageUrl(avatarUrl),
      isVerified: postData.owner?.is_verified || false,
      thumbnailUrl: getProxiedImageUrl(thumbnailUrl)
    };
  };

  const formatNumber = (num: number): string => {
    if( num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPercentageChange = (current: number, base: number = 1000): string => {
    if (base === 0) return '+0%';
    const change = ((current - base) / base) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const handleShareReport = async () => {
    if (!campaignData?.id || !campaignData?.name) {
      console.error('No campaign data available for sharing');
      alert('Campaign data is not available for sharing.');
      return;
    }
    
    console.log('🚀 Starting share report process...');
    console.log('Campaign data:', { id: campaignData.id, name: campaignData.name });
    console.log('Analytics data:', analyticsData);
    
    setIsSharing(true);
    
    try {
      const shareId = `${campaignData.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      console.log('📝 Generated share ID:', shareId);
      
      const requestBody = {
        shareId,
        campaignId: campaignData.id,
        campaignName: campaignData.name,
        analyticsData,
        createdAt: new Date().toISOString(),
        expiresAt
      };
      
      console.log('📤 Sending request to API:', requestBody);
      
      const response = await fetch('/api/shared-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create shared report');
      }

      const result = await response.json();
      console.log('✅ API Success:', result);
      
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/campaign-analytics-report/${campaignData.id}`;
      console.log('🔗 Generated share URL:', shareUrl);
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        console.log('📋 Successfully copied to clipboard');
      } catch (clipboardError) {
        console.warn('⚠️ Clipboard copy failed:', clipboardError);
      }
      
      alert(`Share link created and copied to clipboard!\n\n${shareUrl}\n\nThis link allows public access to the campaign analytics without requiring login.`);
      
      window.open(shareUrl, '_blank');
      
    } catch (error) {
      console.error('💥 Error sharing report:', error);
      alert(`Failed to generate share link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!exportContentRef.current) {
      console.error('Export content ref not found');
      return;
    }
    
    setIsExporting(true);
    
    try {
      const filename = generateExportFilename(campaignData?.name, 'Analytics');
      
      const result = await exportToPDF(exportContentRef.current, {
        filename,
        quality: 0.8,
        format: 'a4',
        orientation: 'portrait',
        margin: 5,
        backgroundColor: '#f8fafc',
        cropWhitespace: true
      });

      if (result.success) {
        console.log('PDF export completed successfully:', result.filename);
      } else {
        console.error('PDF export failed:', result.error);
        alert(result.error || 'Failed to export PDF');
      }
      
    } catch (error) {
      console.error('Unexpected error during PDF export:', error);
      alert('An unexpected error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintExport = async () => {
    if (!exportContentRef.current) {
      console.error('Export content ref not found');
      return;
    }
    
    try {
      const title = `Campaign Analytics - ${campaignData?.name || 'Export'}`;
      const result = await exportToPrint(exportContentRef.current, title);
      
      if (!result.success) {
        console.error('Print export failed:', result.error);
        alert(result.error || 'Failed to export via print');
      }
    } catch (error) {
      console.error('Print export error:', error);
      alert('Print export failed');
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!campaignData?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await getVideoResults(campaignData.id);
        setVideoResults(results);

        // Group videos by influencer to ensure unique counting
        const influencerGroups = new Map<string, VideoResult[]>();
        results.forEach(video => {
          const key = video.influencer_username.toLowerCase();
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
        
        let totalInfluencerEngagementRates = 0;
        let validInfluencerCount = 0;

        // For posts by date chart
        const postDateCounts = new Map<string, number>();

        const influencerPerformanceData: Array<{
          name: string;
          username: string;
          avatar: string;
          clicks: number;
          isVerified: boolean;
          totalPosts: number;
          totalLikes: number;
          totalComments: number;
          avgEngagementRate: number;
          totalEngagement: number;
          followers: number;
        }> = [];

        const allPostsData: Array<{
          id: string;
          influencerName: string;
          username: string;
          avatar: string;
          thumbnail: string;
          likes: number;
          comments: number;
          views: number;
          plays: number;
          shares: number;
          engagementRate: number;
          isVerified: boolean;
          postId: string;
          totalEngagement: number;
        }> = [];

        // Process each unique influencer
        influencerGroups.forEach((videos, username) => {
          let influencerTotalLikes = 0;
          let influencerTotalComments = 0;
          let influencerTotalViews = 0;
          let influencerTotalPlays = 0;
          let influencerFollowers = 0;
          let influencerAvatar = '';
          let influencerName = '';
          let isVerified = false;
          let avgEngagementRate = 0;

          videos.forEach(video => {
            const postDataDetail = getPostData(video);
            
            totalLikes += postDataDetail.likes;
            totalComments += postDataDetail.comments;
            totalViews += postDataDetail.views;
            totalPlays += postDataDetail.plays;
            
            influencerTotalLikes += postDataDetail.likes;
            influencerTotalComments += postDataDetail.comments;
            influencerTotalViews += postDataDetail.views;
            influencerTotalPlays += postDataDetail.plays;
            
            if (postDataDetail.followers > influencerFollowers) {
              influencerFollowers = postDataDetail.followers;
            }

            if (!influencerName || video.full_name) {
              influencerName = video.full_name || video.influencer_username;
              influencerAvatar = postDataDetail.avatarUrl;
              isVerified = postDataDetail.isVerified;
            }

            // Count posts by date
            if (video.post_created_at) {
              const dateKey = new Date(video.post_created_at).toISOString().split('T')[0];
              postDateCounts.set(dateKey, (postDateCounts.get(dateKey) || 0) + 1);
            }

            const totalEngagement = postDataDetail.likes + postDataDetail.comments;
            allPostsData.push({
              id: video.id,
              influencerName: video.full_name || video.influencer_username,
              username: video.influencer_username,
              avatar: postDataDetail.avatarUrl,
              thumbnail: postDataDetail.thumbnailUrl,
              likes: postDataDetail.likes,
              comments: postDataDetail.comments,
              views: postDataDetail.views,
              plays: postDataDetail.plays,
              shares: postDataDetail.shares,
              engagementRate: postDataDetail.engagementRate,
              isVerified: postDataDetail.isVerified,
              postId: video.post_result_obj?.data?.shortcode || video.post_id,
              totalEngagement
            });
          });

          totalFollowers = Math.max(totalFollowers, influencerFollowers);

          if (influencerFollowers > 0) {
            const influencerTotalEngagement = influencerTotalLikes + influencerTotalComments;
            const influencerEngagementRate = (influencerTotalEngagement / influencerFollowers) * 100;
            totalInfluencerEngagementRates += influencerEngagementRate;
            validInfluencerCount++;
            
            avgEngagementRate = influencerEngagementRate;
          } else {
            avgEngagementRate = 0;
          }

          const influencerTotalEngagement = influencerTotalLikes + influencerTotalComments;
          const influencerClicks = Math.round(influencerTotalEngagement * 0.03);

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
            totalEngagement: influencerTotalEngagement,
            followers: influencerFollowers
          });
        });

        // Convert posts by date to array and sort
        const postsByDate = Array.from(postDateCounts.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const topPerformers = influencerPerformanceData
          .sort((a, b) => b.totalEngagement - a.totalEngagement)
          .slice(0, 5);

        const topPosts = allPostsData
          .sort((a, b) => b.totalEngagement - a.totalEngagement)
          .slice(0, 20); // Show more posts in grid format

        const totalPosts = results.length;
        const totalInfluencers = influencerGroups.size;
        
        const averageEngagementRate = validInfluencerCount > 0 ? totalInfluencerEngagementRates / validInfluencerCount : 0;
        
        const totalClicks = Math.round((totalLikes + totalComments) * 0.03);
        
        const videoImpressions = Math.max(totalViews, totalPlays) || 0;
        const estimatedPhotoImpressions = Math.round((totalPosts - (videoImpressions > 0 ? Math.ceil(totalPosts * 0.6) : 0)) * totalFollowers * 0.4);
        const totalImpressions = Math.round(videoImpressions * 1.8 + estimatedPhotoImpressions);
        
        const totalReach = Math.round(Math.max(totalViews, totalPlays, totalImpressions * 0.55));
        
        const maxVideoMetric = Math.max(totalViews, totalPlays);
        const finalImpressions = Math.max(totalImpressions, maxVideoMetric * 1.2);
        const finalReach = Math.min(totalReach, maxVideoMetric * 0.9, finalImpressions * 0.6);

        setAnalyticsData({
          totalClicks,
          totalImpressions: finalImpressions,
          totalReach: finalReach,
          totalLikes,
          totalComments,
          totalViews,
          totalPlays,
          totalFollowers,
          totalPosts,
          totalInfluencers,
          averageEngagementRate,
          postsByDate,
          topPerformers,
          topPosts
        });

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [campaignData?.id]);

  if (isLoading) {
    return (
      <div className="pt-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-pink-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Updated Performance Overview cards with Followers instead of Total Views
  const basicInsightsData = [
    {
      title: "Impressions", 
      value: formatNumber(analyticsData.totalImpressions),
      change: getPercentageChange(analyticsData.totalImpressions, 500000),
      changeType: "positive" as const,
      tooltip: "Total number of times content was displayed to users. This includes multiple views by the same user and should be the highest metric. Calculated based on actual video views (×1.8 for repeat views) plus estimated photo post impressions."
    },
    {
      title: "Reach",
      value: formatNumber(analyticsData.totalReach), 
      change: getPercentageChange(analyticsData.totalReach, 300000),
      changeType: "positive" as const,
      tooltip: "Estimated number of unique users who saw your content. This should be lower than impressions and usually lower than or close to total views/plays, as it only counts each user once regardless of repeat views."
    },
    {
      title: "Total Plays",
      value: formatNumber(analyticsData.totalPlays),
      change: getPercentageChange(analyticsData.totalPlays, 200000),
      changeType: analyticsData.totalPlays > 200000 ? "positive" : "negative" as const,
      tooltip: "Total number of video plays with sound/interaction across all video posts. This metric indicates users who actively engaged with your video content beyond just viewing, pulled from Instagram's video_play_count."
    },
    {
      title: "Followers",
      value: formatNumber(analyticsData.totalFollowers),
      change: getPercentageChange(analyticsData.totalFollowers, 50000),
      changeType: analyticsData.totalFollowers > 50000 ? "positive" : "negative" as const,
      tooltip: "Total number of followers across all influencers in the campaign. This represents the combined audience reach potential of all participating creators."
    },
    {
      title: "Total Likes",
      value: formatNumber(analyticsData.totalLikes),
      change: getPercentageChange(analyticsData.totalLikes, 50000),
      changeType: "positive" as const,
      tooltip: "Real count of likes received across all campaign posts. This data is pulled directly from Instagram's API and represents actual user engagement with your content."
    },
    {
      title: "Total Comments",
      value: formatNumber(analyticsData.totalComments),
      change: getPercentageChange(analyticsData.totalComments, 5000),
      changeType: "positive" as const,
      tooltip: "Real count of comments received across all campaign posts. Comments represent higher engagement than likes and indicate stronger audience interest in your content."
    },
    {
      title: "Total Clicks",
      value: formatNumber(analyticsData.totalClicks),
      change: getPercentageChange(analyticsData.totalClicks),
      changeType: "positive" as const,
      tooltip: "Estimated number of clicks generated from posts. Calculated using a 3% conversion rate from total engagement (likes + comments), which is industry standard for social media campaigns."
    },
    {
      title: "Avg Engagement Rate",
      value: `${analyticsData.averageEngagementRate.toFixed(2)}%`,
      change: analyticsData.averageEngagementRate > 3 ? "+15.2%" : "-5.1%",
      changeType: analyticsData.averageEngagementRate > 3 ? "positive" : "negative" as const,
      tooltip: "Average engagement rate calculated as (total likes + comments) ÷ followers × 100 for each influencer, then averaged. This gives a fair representation of campaign performance across different influencer sizes. Rates above 3% are considered good for Instagram."
    }
  ];

  return (
    <div className="pt-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      {/* Header with Back and Export Buttons - Not included in PDF */}
      <div className="no-print flex items-center justify-between mb-8 px-6">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200 font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShareReport}
            disabled={isSharing || !campaignData?.id}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full hover:from-blue-200 hover:to-blue-300 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Report
              </>
            )}
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full hover:from-green-200 hover:to-green-300 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content to be exported - wrapped in ref */}
      <div ref={exportContentRef} className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-6">
        {/* PDF-only header section */}
        <div className="print-only">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Campaign Analytics</h1>
          {campaignData && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="mr-3">Campaign: {campaignData.name}</span>
              <span>•</span>
              <span className="ml-3">Date: {new Date().toLocaleDateString()}</span>
            </div>
          )}
          <div className="border-b border-gray-200 mb-6"></div>
        </div>

        {/* Campaign Info Banner */}
        {campaignData && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{campaignData.name}</h2>
                </div>
                <div className="text-right ml-8">
                  <div className="relative group">
                    <p className="text-sm text-gray-500">Total Influencers</p>
                    <p className="text-2xl font-bold text-pink-600">{analyticsData.totalInfluencers}</p>
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="relative">
                        Total number of unique influencers participating in this campaign. This count ensures each creator is counted only once, regardless of how many posts they published.
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Insights Section */}
        <div>
          <div className="flex items-center space-x-2 mb-6 no-print">
            <h2 className="text-xl font-bold text-gray-800">Performance Overview</h2>
          </div>

          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {basicInsightsData.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">{item.title}</h3>
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="relative">
                        {item.tooltip}
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-3xl font-bold text-gray-900">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Advanced Insights Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6 no-print">
              <h2 className="text-xl font-bold text-gray-800">Detailed Insights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Engagement Distribution - Donut Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium text-gray-600">Engagement Distribution</h3>
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="relative">
                        Breakdown of total engagement across likes, comments, clicks, and plays. This shows how users interact with your content across different engagement types.
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modern Donut Chart */}
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48 mb-6">
                    {(() => {
                      const total = analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalClicks + analyticsData.totalPlays;
                      const likesPercent = total > 0 ? (analyticsData.totalLikes / total) * 100 : 0;
                      const commentsPercent = total > 0 ? (analyticsData.totalComments / total) * 100 : 0;
                      const clicksPercent = total > 0 ? (analyticsData.totalClicks / total) * 100 : 0;
                      const playsPercent = total > 0 ? (analyticsData.totalPlays / total) * 100 : 0;

                      const circumference = 2 * Math.PI * 70; // radius = 70
                      const likesOffset = circumference - (likesPercent / 100) * circumference;
                      const commentsOffset = circumference - (commentsPercent / 100) * circumference;
                      const clicksOffset = circumference - (clicksPercent / 100) * circumference;
                      const playsOffset = circumference - (playsPercent / 100) * circumference;

                      return (
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                          {/* Background circle */}
                          <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke="#f3f4f6"
                            strokeWidth="20"
                          />
                          
                          {/* Likes segment */}
                          <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={likesOffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            style={{ animationDelay: '0.2s' }}
                          />
                          
                          {/* Comments segment */}
                          <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={commentsOffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            style={{ 
                              animationDelay: '0.4s',
                              transform: `rotate(${likesPercent * 3.6}deg)`,
                              transformOrigin: '100px 100px'
                            }}
                          />
                          
                          {/* Clicks segment */}
                          <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={clicksOffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            style={{ 
                              animationDelay: '0.6s',
                              transform: `rotate(${(likesPercent + commentsPercent) * 3.6}deg)`,
                              transformOrigin: '100px 100px'
                            }}
                          />
                          
                          {/* Plays segment */}
                          <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={playsOffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            style={{ 
                              animationDelay: '0.8s',
                              transform: `rotate(${(likesPercent + commentsPercent + clicksPercent) * 3.6}deg)`,
                              transformOrigin: '100px 100px'
                            }}
                          />
                          
                          {/* Center content */}
                          <text x="100" y="95" textAnchor="middle" className="fill-gray-500 text-xs font-medium transform rotate-90" style={{ transformOrigin: '100px 95px' }}>
                            {/* Total */}
                          </text>
                          <text x="95" y="115" textAnchor="middle" className="fill-gray-900 text-sm font-bold transform rotate-90" style={{ transformOrigin: '100px 110px' }}>
                            {formatNumber(total)}
                          </text>
                        </svg>
                      );
                    })()}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 truncate">Likes</div>
                        <div className="text-sm font-semibold text-gray-900">{formatNumber(analyticsData.totalLikes)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 truncate">Comments</div>
                        <div className="text-sm font-semibold text-gray-900">{formatNumber(analyticsData.totalComments)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 truncate">Clicks</div>
                        <div className="text-sm font-semibold text-gray-900">{formatNumber(analyticsData.totalClicks)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 truncate">Plays</div>
                        <div className="text-sm font-semibold text-gray-900">{formatNumber(analyticsData.totalPlays)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts by Date Bar Chart - Now spans 2 columns */}
              <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium text-gray-600">Posts by Date</h3>
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="relative">
                        Distribution of posts over time showing campaign activity timeline. This helps identify peak posting periods and campaign momentum.
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Bar Chart */}
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.postsByDate.length > 0 ? (
                    analyticsData.postsByDate.slice(0, 12).map((item, index) => {
                      const maxCount = Math.max(...analyticsData.postsByDate.map(p => p.count));
                      const barHeight = maxCount > 0 ? (item.count / maxCount) * 200 : 0;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                          {/* Bar */}
                          <div className="relative w-full flex flex-col justify-end h-52 mb-3">
                            {/* Hover tooltip */}
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              {item.count} post{item.count !== 1 ? 's' : ''}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                            </div>
                            
                            {/* Count label above bar */}
                            <div className="text-xs font-medium text-gray-700 text-center mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {item.count}
                            </div>
                            
                            {/* Animated bar */}
                            <div 
                              className="w-full bg-gradient-to-t from-pink-400 to-purple-500 rounded-t-lg transition-all duration-700 ease-out hover:from-pink-500 hover:to-purple-600 shadow-sm group-hover:shadow-md"
                              style={{ 
                                height: `${barHeight}px`,
                                animationDelay: `${index * 0.1}s`
                              }}
                            />
                          </div>
                          
                          {/* Date label */}
                          <div className="text-xs text-gray-500 text-center transform rotate-0 whitespace-nowrap">
                            {new Date(item.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full text-center py-16">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No post data available</p>
                      <p className="text-gray-400 text-xs mt-1">Posts will appear here once data is collected</p>
                    </div>
                  )}
                </div>

                {/* Summary stats */}
                {analyticsData.postsByDate.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{analyticsData.totalPosts}</div>
                        <div className="text-xs text-gray-500">Total Posts</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{Math.max(...analyticsData.postsByDate.map(p => p.count))}</div>
                        <div className="text-xs text-gray-500">Peak Day</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{(analyticsData.totalPosts / analyticsData.postsByDate.length).toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Avg per Day</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Performing Posts Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Top Performing Posts</h3>
                <div className="relative group">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="relative">
                      Top performing posts ranked by total engagement. These posts generated the highest interaction rates and can provide insights into what content types resonate best with your target audience.
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {analyticsData.topPosts.length > 0 ? (
                  analyticsData.topPosts.map((post, index) => (
                    <div 
                      key={post.id} 
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                      onClick={() => {
                        if (post.postId) {
                          window.open(`https://www.instagram.com/p/${post.postId}/`, '_blank');
                        }
                      }}
                    >
                      {/* Post Thumbnail */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={post.thumbnail}
                          alt={`${post.username} post`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/dummy-image.jpg';
                          }}
                        />
                        {/* Instagram indicator */}
                        <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                          </svg>
                        </div>
                        {/* Rank badge */}
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                          #{index + 1}
                        </div>
                      </div>
                      
                      {/* Post Stats */}
                      <div className="p-3">
                        <div className="flex items-center space-x-1 mb-2">
                          <img
                            src={post.avatar}
                            alt={post.username}
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                            }}
                          />
                          <span className="text-xs font-medium text-gray-700 truncate">@{post.username}</span>
                          {post.isVerified && (
                            <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium text-gray-700">{formatNumber(post.likes)}</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span className="font-medium text-gray-700">{formatNumber(post.comments)}</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                              <span className="font-medium text-gray-700">{formatNumber(post.shares)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No post data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Performing Influencers Section - Now at the end with improved design */}
          <div className="mb-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Top Performing Influencers</h3>
                <div className="relative group">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="relative">
                      Top 5 influencers ranked by total engagement (likes + comments). This shows which creators generated the most interaction with their audience and delivered the best performance for your campaign.
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {analyticsData.topPerformers.length > 0 ? (
                  analyticsData.topPerformers.map((influencer, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
                      {/* Rank Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          #{index + 1}
                        </div>
                        {influencer.isVerified && (
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {/* Profile Image */}
                      <div className="relative mb-4">
                        <div className="w-20 h-20 mx-auto relative">
                          <img 
                            src={influencer.avatar}
                            alt={influencer.name}
                            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                            }}
                          />
                          {/* Instagram gradient ring */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-1">
                            <div className="w-full h-full rounded-full bg-white"></div>
                          </div>
                          <img 
                            src={influencer.avatar}
                            alt={influencer.name}
                            className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Influencer Info */}
                      <div className="text-center mb-4">
                        <h4 className="font-bold text-gray-900 mb-1 truncate text-sm">{influencer.name}</h4>
                        <p className="text-xs text-gray-500 truncate">@{influencer.username}</p>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{formatNumber(influencer.totalEngagement)}</div>
                            <div className="text-xs text-gray-500">Total Engagement</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                            <div className="text-sm font-semibold text-gray-900">{formatNumber(influencer.followers)}</div>
                            <div className="text-xs text-gray-500">Followers</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                            <div className="text-sm font-semibold text-gray-900">{influencer.totalPosts}</div>
                            <div className="text-xs text-gray-500">Posts</div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-2 text-center">
                          <div className="text-sm font-semibold text-pink-600">{influencer.avgEngagementRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Avg Engagement</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No influencer data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;