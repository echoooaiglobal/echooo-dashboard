// src/app/shared-report/[shareId]/page.tsx (for app directory)
'use client';

import { useState, useEffect } from 'react';

interface SharedReportData {
  shareId: string;
  campaignId: string;
  campaignName: string;
  analyticsData: {
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
      engagementRate: number;
      isVerified: boolean;
      postId: string;
      totalEngagement: number;
    }>;
  };
  createdAt: string;
  expiresAt: string;
}

interface SharedReportPageProps {
  params: {
    shareId: string;
  };
}

const SharedReportPage: React.FC<SharedReportPageProps> = ({ params }) => {
  const { shareId } = params;
  
  const [reportData, setReportData] = useState<SharedReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const formatNumber = (num: number): string => {
    if (num === null || num === undefined || isNaN(num)) return '0';
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

  useEffect(() => {
    const fetchSharedReport = async () => {
      if (!shareId) {
        console.log('❌ No shareId provided');
        return;
      }

      console.log('🔍 Fetching shared report for shareId:', shareId);

      try {
        setIsLoading(true);
        
        // Use the correct API endpoint that you confirmed works
        const apiUrl = `/api/shared-reports/${shareId}`;
        console.log('📤 Making request to:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        console.log('📥 API Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error response:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            console.error('❌ Failed to parse error response as JSON');
            errorData = { error: errorText };
          }
          
          if (response.status === 404) {
            setError('Shared report not found. The link may be invalid.');
          } else if (response.status === 410) {
            setIsExpired(true);
            setError('This shared report has expired.');
          } else {
            setError(errorData.error || 'Failed to load shared report.');
          }
          return;
        }

        const result = await response.json();
        console.log('✅ API Success response:', result);
        
        const reportData = result.data;

        if (!reportData) {
          console.error('❌ No data in API response');
          setError('Invalid report data received.');
          return;
        }

        // Check if report is expired (double-check on client side)
        const now = new Date();
        const expirationDate = new Date(reportData.expiresAt);
        
        console.log('⏰ Checking expiration:', {
          now: now.toISOString(),
          expiresAt: reportData.expiresAt,
          isExpired: now > expirationDate
        });
        
        if (now > expirationDate) {
          setIsExpired(true);
          setError('This shared report has expired.');
          return;
        }

        console.log('✅ Setting report data:', reportData);
        setReportData(reportData);
        
      } catch (err) {
        console.error('💥 Error fetching shared report:', err);
        setError('Failed to load shared report. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedReport();
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-pink-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 text-lg">Loading shared report...</p>
        </div>
      </div>
    );
  }

  if (error || isExpired || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-6">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {isExpired ? 'Report Expired' : 'Report Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The shared report you\'re looking for could not be found or may have been removed.'}
          </p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all duration-200 font-medium"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const { analyticsData, campaignName, createdAt } = reportData;

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
      title: "Total Plays",
      value: formatNumber(analyticsData.totalPlays),
      change: getPercentageChange(analyticsData.totalPlays, 200000),
      changeType: analyticsData.totalPlays > 200000 ? "positive" : "negative" as const,
      subtitle: "Video plays across all posts"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Campaign Analytics Report</h1>
              <p className="text-sm text-gray-600 mt-1">
                Shared on {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                📊 Shared Report
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Campaign Info Banner */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{campaignName}</h2>
                <p className="text-gray-600 mt-1">Analytics Overview</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Influencers</p>
                <p className="text-3xl font-bold text-pink-600">{analyticsData.totalInfluencers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Performance Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {basicInsightsData.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">{item.title}</h3>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="mb-3">
                  <span className="text-3xl font-bold text-gray-900">{item.value}</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Detailed Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Platform Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Platform Distribution</h3>
              
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#3b82f6" strokeWidth="20" 
                          strokeDasharray={`${100 * 4.4} ${0 * 4.4}`} strokeDashoffset="0"/>
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
              <h3 className="text-sm font-medium text-gray-600 mb-4">Engagement Distribution</h3>
              
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#06b6d4" strokeWidth="20" 
                          strokeDasharray={`${70 * 4.4} ${30 * 4.4}`} strokeDashoffset="0"/>
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#3b82f6" strokeWidth="20" 
                          strokeDasharray={`${30 * 4.4} ${70 * 4.4}`} strokeDashoffset={`-${70 * 4.4}`}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.totalLikes + analyticsData.totalComments)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Likes</span>
                  </div>
                  <span className="text-sm font-medium">{formatNumber(analyticsData.totalLikes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Comments</span>
                  </div>
                  <span className="text-sm font-medium">{formatNumber(analyticsData.totalComments)}</span>
                </div>
              </div>
            </div>

            {/* Video Performance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Video Performance</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.totalViews)}</p>
                    <p className="text-xs text-gray-500">Total Views</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.totalPlays)}</p>
                    <p className="text-xs text-gray-500">Total Plays</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: analyticsData.totalPlays > 0 && analyticsData.totalViews > 0 
                        ? `${Math.min((analyticsData.totalViews / analyticsData.totalPlays) * 100, 100)}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    View to Play Ratio: {
                      analyticsData.totalPlays > 0 && analyticsData.totalViews > 0
                        ? `${((analyticsData.totalViews / analyticsData.totalPlays) * 100).toFixed(1)}%`
                        : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Influencers */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Performing Influencers</h3>

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
                      <svg className="w-full h-6" viewBox="0 0 100 20">
                        <path d={`M 0 ${15 - (index * 2)} Q 25 ${10 - index} 50 ${12 - index} T 100 ${8 - index}`} stroke="#a855f7" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{formatNumber(influencer.totalEngagement)}</span>
                        <p className="text-xs text-gray-500">Total Engagement</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        <p>{influencer.totalPosts} posts • {influencer.avgEngagementRate.toFixed(1)}% avg eng</p>
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

        {/* Top Performing Posts */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Performing Posts</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {analyticsData.topPosts.length > 0 ? (
                analyticsData.topPosts.map((post, index) => (
                  <div key={post.id} className="text-center">
                    <div className="relative mb-4">
                      <img
                        src={post.thumbnail}
                        alt={`${post.username} post`}
                        className="w-16 h-16 rounded-lg mx-auto border-2 border-gray-200 shadow-sm object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/dummy-image.jpg';
                        }}
                      />
                      {/* Instagram indicator */}
                      <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                        </svg>
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1 truncate">{post.influencerName}</h4>
                    <div className="flex items-center justify-center space-x-1 mb-3">
                      <p className="text-sm text-gray-500 truncate">@{post.username}</p>
                      {post.isVerified && (
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <svg className="w-full h-6" viewBox="0 0 100 20">
                        <path d={`M 0 ${15 - (index * 2)} Q 25 ${10 - index} 50 ${12 - index} T 100 ${8 - index}`} stroke="#10b981" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{formatNumber(post.totalEngagement)}</span>
                        <p className="text-xs text-gray-500">Total Engagement</p>
                      </div>
                      <div className="text-xs text-gray-400 space-y-0.5">
                        <p>{formatNumber(post.likes)} likes • {formatNumber(post.comments)} comments</p>
                        <div className="flex justify-center space-x-2">
                          {post.views > 0 && <span>{formatNumber(post.views)} views</span>}
                          {post.plays > 0 && <span>• {formatNumber(post.plays)} plays</span>}
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

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            This report was generated and shared on {new Date(createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Campaign Analytics Dashboard • Powered by Your Analytics Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedReportPage;