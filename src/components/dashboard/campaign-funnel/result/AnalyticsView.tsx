// src/components/dashboard/campaign-funnel/result/AnalyticsView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getVideoResults } from '@/services/video-results';
import { VideoResult } from '@/types/user-detailed-info';
import { Campaign } from '@/services/campaign/campaign.service';
import { exportToPDF, exportToPrint, generateExportFilename } from '@/utils/pdfExportUtils';

interface AnalyticsData {
  totalClicks: number;
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalFollowers: number;
  totalPosts: number;
  averageEngagementRate: number;
  topPerformers: Array<{
    name: string;
    username: string;
    avatar: string;
    clicks: number;
    isVerified: boolean;
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
    totalFollowers: 0,
    totalPosts: 0,
    averageEngagementRate: 0,
    topPerformers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
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
      views: video.views_count || video.plays_count || 0,
      followers: 0,
      engagementRate: 0,
      avatarUrl: getProxiedImageUrl(video.profile_pic_url || ''),
      isVerified: false
    };

    const likes = postData.edge_media_preview_like?.count || 
                  postData.edge_liked_by?.count || 
                  video.likes_count || 0;
    
    const comments = postData.edge_media_to_comment?.count || 
                     postData.edge_media_preview_comment?.count || 
                     postData.edge_media_to_parent_comment?.count ||
                     video.comments_count || 0;
    
    const views = postData.video_view_count || 
                  postData.video_play_count || 
                  video.views_count || 
                  video.plays_count || 0;
    
    const followers = postData.owner?.edge_followed_by?.count || 0;
    const engagementRate = followers > 0 ? ((likes + comments) / followers) * 100 : 0;
    
    let avatarUrl = '/user/profile-placeholder.png';
    if (postData.owner?.profile_pic_url) {
      avatarUrl = postData.owner.profile_pic_url;
    } else if (video.profile_pic_url) {
      avatarUrl = video.profile_pic_url;
    }
    
    return {
      likes,
      comments,
      views,
      followers,
      engagementRate,
      avatarUrl: getProxiedImageUrl(avatarUrl),
      isVerified: postData.owner?.is_verified || false
    };
  };

  const formatNumber = (num: number): string => {
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

        let totalLikes = 0;
        let totalComments = 0;
        let totalViews = 0;
        let totalFollowers = 0;
        let totalEngagementRates = 0;
        let validEngagementCount = 0;

        const performerData: Array<{
          name: string;
          username: string;
          avatar: string;
          clicks: number;
          isVerified: boolean;
        }> = [];

        results.forEach(video => {
          const postData = getPostData(video);
          
          totalLikes += postData.likes;
          totalComments += postData.comments;
          totalViews += postData.views;
          totalFollowers += postData.followers;
          
          if (postData.engagementRate > 0) {
            totalEngagementRates += postData.engagementRate;
            validEngagementCount++;
          }

          const simulatedClicks = Math.round((postData.likes + postData.comments) * 0.8);
          performerData.push({
            name: video.full_name || video.influencer_username,
            username: video.influencer_username,
            avatar: postData.avatarUrl,
            clicks: simulatedClicks,
            isVerified: postData.isVerified
          });
        });

        const topPerformers = performerData
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 5);

        const totalPosts = results.length;
        const averageEngagementRate = validEngagementCount > 0 ? totalEngagementRates / validEngagementCount : 0;
        
        const totalClicks = Math.round((totalLikes + totalComments) * 0.7);
        const totalImpressions = Math.round(totalClicks * 15);
        const totalReach = Math.round(totalImpressions * 0.65);

        setAnalyticsData({
          totalClicks,
          totalImpressions,
          totalReach,
          totalLikes,
          totalComments,
          totalViews,
          totalFollowers,
          totalPosts,
          averageEngagementRate,
          topPerformers
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

  const basicInsightsData = [
    {
      title: "Total Clicks",
      value: formatNumber(analyticsData.totalClicks),
      change: getPercentageChange(analyticsData.totalClicks),
      changeType: "positive" as const,
      subtitle: "Estimated clicks from engagement data"
    },
    {
      title: "Impressions", 
      value: formatNumber(analyticsData.totalImpressions),
      change: getPercentageChange(analyticsData.totalImpressions, 500000),
      changeType: "positive" as const,
      subtitle: "Estimated total impressions"
    },
    {
      title: "Reach",
      value: formatNumber(analyticsData.totalReach), 
      change: getPercentageChange(analyticsData.totalReach, 300000),
      changeType: "positive" as const,
      subtitle: "Estimated unique reach"
    },
    {
      title: "Total Likes",
      value: formatNumber(analyticsData.totalLikes),
      change: getPercentageChange(analyticsData.totalLikes, 50000),
      changeType: "positive" as const,
      subtitle: "Actual likes across all posts"
    },
    {
      title: "Total Comments",
      value: formatNumber(analyticsData.totalComments),
      change: getPercentageChange(analyticsData.totalComments, 5000),
      changeType: "positive" as const,
      subtitle: "Actual comments across all posts"
    },
    {
      title: "Total Views",
      value: formatNumber(analyticsData.totalViews),
      change: getPercentageChange(analyticsData.totalViews, 100000),
      changeType: analyticsData.totalViews > 100000 ? "positive" : "negative" as const,
      subtitle: "Video views across all posts"
    },
    {
      title: "Avg Engagement Rate",
      value: `${analyticsData.averageEngagementRate.toFixed(2)}%`,
      change: analyticsData.averageEngagementRate > 3 ? "+15.2%" : "-5.1%",
      changeType: analyticsData.averageEngagementRate > 3 ? "positive" : "negative" as const,
      subtitle: "Average engagement across influencers"
    },
    {
      title: "Total Posts",
      value: analyticsData.totalPosts.toString(),
      change: `+${analyticsData.totalPosts}`,
      changeType: "positive" as const,
      subtitle: "Published posts in this campaign"
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

          <button
            onClick={handlePrintExport}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full hover:from-blue-200 hover:to-blue-300 transition-all duration-200 font-medium shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
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
                  <p className="text-sm text-gray-500">Total Influencers</p>
                  <p className="text-2xl font-bold text-pink-600">{analyticsData.totalPosts}</p>
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
                  <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>

                <div className="mb-3">
                  <span className="text-3xl font-bold text-gray-900">{item.value}</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{item.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Advanced Insights Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6 no-print">
              <h2 className="text-xl font-bold text-gray-800">Detailed Insights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Platform Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Platform Distribution</h3>
                </div>
                
                <div className="relative flex items-center justify-center mb-6">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20" 
                            strokeDasharray={`${100 * 5.03} ${0 * 5.03}`} strokeDashoffset="0"/>
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Instagram</span>
                    </div>
                    <span className="text-sm font-medium">100%</span>
                  </div>
                </div>
              </div>

              {/* Engagement Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Engagement Distribution</h3>
                </div>
                
                <div className="relative flex items-center justify-center mb-6">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="20" 
                            strokeDasharray={`${70 * 5.03} ${30 * 5.03}`} strokeDashoffset="0"/>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20" 
                            strokeDasharray={`${30 * 5.03} ${70 * 5.03}`} strokeDashoffset={`-${70 * 5.03}`}/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm text-gray-500">Total Engagement</span>
                    <span className="text-3xl font-bold text-gray-900">{formatNumber(analyticsData.totalLikes + analyticsData.totalComments)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Likes ({formatNumber(analyticsData.totalLikes)})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Comments ({formatNumber(analyticsData.totalComments)})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Timeline */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Performance Trend</h3>
                </div>
                
                <div className="h-32 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    <defs>
                      <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1"/>
                      </linearGradient>
                    </defs>
                    <path d="M 0 80 Q 50 60 100 70 T 200 50 T 300 40 L 300 120 L 0 120 Z" fill="url(#performanceGradient)"/>
                    <path d="M 0 80 Q 50 60 100 70 T 200 50 T 300 40" stroke="#a855f7" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>Day 1</span>
                  <span>Day 7</span>
                  <span>Day 14</span>
                  <span>Day 21</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Influencers Section */}
          <div className="mb-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Top Performing Influencers</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {analyticsData.topPerformers.length > 0 ? (
                  analyticsData.topPerformers.map((influencer, index) => (
                    <div key={index} className="text-center">
                      <div className="relative mb-4">
                        <img
                          src={influencer.avatar}
                          alt={influencer.name}
                          className="w-16 h-16 rounded-full mx-auto border-2 border-gray-200 shadow-sm object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                          }}
                        />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1 truncate">{influencer.name}</h4>
                      <div className="flex items-center justify-center space-x-1 mb-3">
                        <p className="text-sm text-gray-500 truncate">@{influencer.username}</p>
                        {influencer.isVerified && (
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <svg className="w-full h-8" viewBox="0 0 100 20">
                          <path d={`M 0 ${15 - (index * 2)} Q 25 ${10 - index} 50 ${12 - index} T 100 ${8 - index}`} stroke="#a855f7" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-xl font-bold text-gray-900">{formatNumber(influencer.clicks)}</span>
                        <p className="text-xs text-gray-500">Estimated Clicks</p>
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