// src/components/dashboard/campaign-funnel/result/DetailedInsights.tsx
'use client';

import { useState } from 'react';
import { AnalyticsData } from './types';

interface DetailedInsightsProps {
  analyticsData: AnalyticsData;
}

const DetailedInsights: React.FC<DetailedInsightsProps> = ({ analyticsData }) => {
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // UPDATED: Function to get consistent post data matching PublishedResults table logic
  const getConsistentPostData = (post: any) => {
    const postData = post.post_result_obj?.data;
    
    if (!postData) {
      // When no post data, use whichever is greater between views_count and plays_count
      const viewsFromAPI = Math.max(0, post.views_count || post.views || 0);
      const playsFromAPI = Math.max(0, post.plays_count || post.plays || 0);
      const finalViews = Math.max(viewsFromAPI, playsFromAPI);
      
      return {
        likes: Math.max(0, post.likes_count || post.likes || 0),
        comments: Math.max(0, post.comments_count || post.comments || 0),
        shares: Math.max(0, post.shares_count || post.shares || 0),
        views: finalViews,
        videoPlayCount: playsFromAPI,
        followers: post.followers_count || post.followers || 0
      };
    }

    // When post data is available, use the same logic as PublishedResults
    const likes = Math.max(0, postData.edge_media_preview_like?.count || 
                  postData.edge_liked_by?.count || 
                  post.likes_count || post.likes || 0);
    
    const comments = Math.max(0, postData.edge_media_to_comment?.count || 
                     postData.edge_media_preview_comment?.count || 
                     postData.edge_media_to_parent_comment?.count ||
                     post.comments_count || post.comments || 0);
    
    const shares = Math.max(0, 
      post.shares_count || post.shares ||
      postData.shares_count ||
      postData.edge_media_to_share?.count || 
      0
    );
    
    // CRITICAL: Use video_play_count from API for consistent views (same as PublishedResults)
    const videoPlayCount = Math.max(0, postData.video_play_count || 0);
    
    // Keep existing logic for other view calculations for backwards compatibility
    const videoPlaysFromAPI = Math.max(0, postData.video_view_count || postData.video_play_count || 0);
    const generalViewsFromAPI = Math.max(0, post.views_count || post.views || 0);
    const playsFromVideo = Math.max(0, post.plays_count || post.plays || 0);
    const views = Math.max(videoPlaysFromAPI, generalViewsFromAPI, playsFromVideo);
    
    const followers = Math.max(0, post.followers_count || post.followers || postData.owner?.edge_followed_by?.count || 0);
    
    return {
      likes,
      comments,
      shares,
      views,
      videoPlayCount, // This should match PublishedResults table Views column
      followers
    };
  };

  // UPDATED: Function to calculate total views using PublishedResults logic
  const calculateTotalViewsFromPublishedResults = (): number => {
    // Get all posts from the same sources as PublishedResults table
    const allPosts = [
      ...analyticsData.topPosts,
      ...analyticsData.postsByDate.flatMap(dateGroup => 
        dateGroup.posts.map(post => ({
          ...post,
          username: post.username
        }))
      )
    ];

    if (allPosts.length > 0) {
      const totalViewsFromPosts = allPosts.reduce((sum, post) => {
        const postViewData = getConsistentPostData(post);
        // Use videoPlayCount to match PublishedResults Views column exactly
        return sum + postViewData.videoPlayCount;
      }, 0);

      console.log('📊 DetailedInsights Total Views Calculation (matching PublishedResults):');
      console.log(`Total posts processed: ${allPosts.length}`);
      console.log(`Calculated total views: ${totalViewsFromPosts}`);
      console.log(`Original analyticsData.totalViews: ${analyticsData.totalViews}`);
      
      return totalViewsFromPosts;
    }

    return analyticsData.totalViews;
  };

  // UPDATED: Process postsByDate to use consistent view calculations
  const processedPostsByDate = analyticsData.postsByDate.map(dateGroup => {
    const processedPosts = dateGroup.posts.map(post => {
      const postViewData = getConsistentPostData(post);
      return {
        ...post,
        views: postViewData.videoPlayCount, // Use consistent view calculation
        likes: postViewData.likes,
        comments: postViewData.comments,
        shares: postViewData.shares,
        influencerName: post.influencerName || post.username || 'Unknown',
        avatar: post.avatar || post.profile_pic_url || '/user/profile-placeholder.png'
      };
    });

    // Recalculate totals for this date using processed data
    const totalViewsForDate = processedPosts.reduce((sum, post) => sum + post.views, 0);
    
    return {
      ...dateGroup,
      posts: processedPosts,
      views: totalViewsForDate, // Update with consistent calculation
      cumulativeViews: 0 // Will be calculated below
    };
  });

  // UPDATED: Recalculate cumulative views using processed data
  let cumulativeTotal = 0;
  processedPostsByDate.forEach(dateGroup => {
    cumulativeTotal += dateGroup.views;
    dateGroup.cumulativeViews = cumulativeTotal;
  });

  const totalViewsConsistent = calculateTotalViewsFromPublishedResults();

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-6 no-print">
        <h2 className="text-xl font-bold text-gray-800">Detailed Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Engagement Distribution */}
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
                  Breakdown of total engagement across likes, comments, shares, and views. Shows how users interact with your content across different engagement types. Views now match PublishedResults table.
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Bar Chart - UPDATED to use consistent total views */}
          <div className="space-y-4">
            {(() => {
              const data = [
                { label: 'Likes', value: analyticsData.totalLikes, color: 'bg-gradient-to-r from-pink-500 to-pink-600' },
                { label: 'Comments', value: analyticsData.totalComments, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
                { label: 'Shares', value: analyticsData.totalShares, color: 'bg-gradient-to-r from-green-500 to-green-600' },
                { label: 'Views', value: totalViewsConsistent, color: 'bg-gradient-to-r from-purple-500 to-purple-600' }
              ];
              const maxValue = Math.max(...data.map(item => item.value));
              
              return data.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className="text-gray-900 font-semibold">{formatNumber(item.value)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                        animationDelay: `${index * 0.2}s`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {maxValue > 0 ? `${((item.value / maxValue) * 100).toFixed(1)}%` : '0%'} of total
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Summary - UPDATED to use consistent total views */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatNumber(analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares + totalViewsConsistent)}
            </div>
            <div className="text-xs text-gray-500">Total Interactions</div>
          </div>
        </div>

        {/* Views Over Time Chart - UPDATED to use processed data */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-gray-600">Views Over Time</h3>
            <div className="relative group">
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="relative">
                  Cumulative view count showing campaign momentum over time. Each data point represents the total accumulated views up to that date. Hover over data points to see detailed post information. Now uses video_play_count for consistent view calculations.
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart - UPDATED to use processedPostsByDate */}
          <div className="h-80 relative">
            {processedPostsByDate.length > 0 ? (
              <div className="relative h-full bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200 p-4 pl-12 pb-12 shadow-sm">
                <div 
                  className="relative h-full"
                  style={{ paddingBottom: '30px' }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  {/* Grid lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                    {/* Horizontal grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <line
                        key={`h-${i}`}
                        x1="60"
                        y1={20 + (i * (180 / 4))}
                        x2="calc(100% - 20px)"
                        y2={20 + (i * (180 / 4))}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    ))}
                    {/* Vertical grid lines */}
                    {processedPostsByDate.map((item, index) => {
                      const chartWidth = 70;
                      const chartStart = 15;
                      
                      let xPercent;
                      if (processedPostsByDate.length === 1) {
                        xPercent = 50;
                      } else {
                        xPercent = chartStart + (index / (processedPostsByDate.length - 1)) * chartWidth;
                      }
                      
                      return (
                        <line
                          key={`v-${index}`}
                          x1={`${xPercent}%`}
                          y1="20"
                          x2={`${xPercent}%`}
                          y2="200"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      );
                    })}
                  </svg>

                  {/* Data visualization */}
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
                    <defs>
                      <linearGradient id="areaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Smooth curved line and area chart */}
                    {processedPostsByDate.length > 1 && (
                      <>
                        {/* Area fill with smooth curves */}
                        <path
                          d={(() => {
                            const maxViews = Math.max(...processedPostsByDate.map(p => p.cumulativeViews));
                            const roundedMax = Math.ceil(maxViews / 100000) * 100000;
                            if (roundedMax === 0 || processedPostsByDate.length === 0) return '';
                            
                            const chartWidth = 70;
                            const chartStart = 15;
                            
                            if (processedPostsByDate.length === 1) {
                              const xPercent = 50;
                              const y = 200 - (processedPostsByDate[0].cumulativeViews / roundedMax) * 180;
                              return `M ${xPercent}%,${y} L ${xPercent}%,200 L ${xPercent}%,200 Z`;
                            }
                            
                            let pathData = '';
                            
                            // Start path
                            const firstXPercent = chartStart;
                            const firstY = 200 - (processedPostsByDate[0].cumulativeViews / roundedMax) * 180;
                            pathData = `M ${firstXPercent}%,${firstY}`;
                            
                            // Add smooth curves for the top line
                            processedPostsByDate.forEach((item, index) => {
                              if (index === 0) return;
                              
                              const xPercent = chartStart + (index / (processedPostsByDate.length - 1)) * chartWidth;
                              const y = 200 - (item.cumulativeViews / roundedMax) * 180;
                              
                              // Get previous point
                              const prevXPercent = chartStart + ((index - 1) / (processedPostsByDate.length - 1)) * chartWidth;
                              const prevY = 200 - (processedPostsByDate[index - 1].cumulativeViews / roundedMax) * 180;
                              
                              // Calculate control points for smooth curve
                              const controlPointOffset = (xPercent - prevXPercent) * 0.4;
                              const cp1x = prevXPercent + controlPointOffset;
                              const cp1y = prevY;
                              const cp2x = xPercent - controlPointOffset;
                              const cp2y = y;
                              
                              // Add smooth curve using cubic bezier
                              pathData += ` C ${cp1x}%,${cp1y} ${cp2x}%,${cp2y} ${xPercent}%,${y}`;
                            });
                            
                            // Close the path to create area fill
                            const lastXPercent = chartStart + chartWidth;
                            pathData += ` L ${lastXPercent}%,200 L ${firstXPercent}%,200 Z`;
                            
                            return pathData;
                          })()}
                          fill="url(#areaGradient1)"
                          className="transition-all duration-300"
                        />

                        {/* Main connecting line path with smooth curves */}
                        <path
                          d={(() => {
                            const maxViews = Math.max(...processedPostsByDate.map(p => p.cumulativeViews));
                            const roundedMax = Math.ceil(maxViews / 100000) * 100000;
                            if (roundedMax === 0 || processedPostsByDate.length === 0) return '';
                            
                            const chartWidth = 70;
                            const chartStart = 15;
                            
                            if (processedPostsByDate.length === 1) {
                              // Single point - just return a small circle path
                              const y = 200 - (processedPostsByDate[0].cumulativeViews / roundedMax) * 180;
                              return `M 50%,${y} L 50%,${y}`;
                            }
                            
                            let pathData = '';
                            
                            processedPostsByDate.forEach((item, index) => {
                              const xPercent = chartStart + (index / (processedPostsByDate.length - 1)) * chartWidth;
                              const y = 200 - (item.cumulativeViews / roundedMax) * 180;
                              
                              if (index === 0) {
                                pathData = `M ${xPercent}%,${y}`;
                              } else {
                                // Get previous point
                                const prevXPercent = chartStart + ((index - 1) / (processedPostsByDate.length - 1)) * chartWidth;
                                const prevY = 200 - (processedPostsByDate[index - 1].cumulativeViews / roundedMax) * 180;
                                
                                // Calculate control points for smooth curve
                                const controlPointOffset = (xPercent - prevXPercent) * 0.4; // 40% of distance
                                const cp1x = prevXPercent + controlPointOffset;
                                const cp1y = prevY;
                                const cp2x = xPercent - controlPointOffset;
                                const cp2y = y;
                                
                                // Add smooth curve using cubic bezier
                                pathData += ` C ${cp1x}%,${cp1y} ${cp2x}%,${cp2y} ${xPercent}%,${y}`;
                              }
                            });
                            
                            return pathData;
                          })()}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.3))' }}
                        />
                      </>
                    )}
                    
                    {/* Data points with enhanced visibility */}
                    {processedPostsByDate.map((item, index) => {
                      const chartWidth = 70;
                      const chartStart = 15;
                      
                      let xPercent;
                      if (processedPostsByDate.length === 1) {
                        xPercent = 50;
                      } else {
                        xPercent = chartStart + (index / (processedPostsByDate.length - 1)) * chartWidth;
                      }
                      
                      const maxViews = Math.max(...processedPostsByDate.map(p => p.cumulativeViews));
                      const roundedMax = Math.ceil(maxViews / 100000) * 100000;
                      const y = roundedMax > 0 ? 200 - (item.cumulativeViews / roundedMax) * 180 : 200;
                      
                      return (
                        <g key={index}>
                          {/* Outer glow circle */}
                          <circle
                            cx={`${xPercent}%`}
                            cy={y}
                            r="8"
                            fill="#2563eb"
                            fillOpacity="0.2"
                            className="transition-all duration-200"
                          />
                          {/* Main data point */}
                          <circle
                            cx={`${xPercent}%`}
                            cy={y}
                            r="5"
                            fill="#2563eb"
                            stroke="#ffffff"
                            strokeWidth="3"
                            className="cursor-pointer hover:r-7 transition-all duration-200"
                            onMouseEnter={() => setHoveredDataPoint(item)}
                            onMouseLeave={() => setHoveredDataPoint(null)}
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.4))' }}
                          />
                        </g>
                      );
                    })}

                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4].map(i => {
                      const maxViews = Math.max(...processedPostsByDate.map(p => p.cumulativeViews));
                      const roundedMax = Math.ceil(maxViews / 100000) * 100000;
                      const value = roundedMax * (1 - i / 4);
                      return (
                        <text
                          key={`y-${i}`}
                          x="50"
                          y={20 + (i * (180 / 4)) + 5}
                          textAnchor="end"
                          className="fill-gray-500 text-xs font-medium"
                        >
                          {formatNumber(value)}
                        </text>
                      );
                    })}
                  </svg>

                  {/* Tooltip */}
                  {hoveredDataPoint && (
                    <div 
                      className="absolute z-20 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[280px] max-w-[400px] pointer-events-none"
                      style={{
                        left: mousePosition.x + 15,
                        top: mousePosition.y - 120,
                        transform: mousePosition.x > 400 ? 'translateX(-100%)' : 'none'
                      }}
                    >
                      <div className="mb-3">
                        <div className="font-semibold text-sm text-gray-900 mb-1">
                          {new Date(hoveredDataPoint.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {hoveredDataPoint.count} post{hoveredDataPoint.count !== 1 ? 's' : ''} published
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily Views:</span>
                          <span className="font-medium text-blue-600">{formatNumber(hoveredDataPoint.views)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2">
                          <span className="text-gray-600">Total Views:</span>
                          <span className="font-bold text-gray-900">{formatNumber(hoveredDataPoint.cumulativeViews)}</span>
                        </div>
                      </div>

                      {/* Post Details */}
                      {hoveredDataPoint.posts && hoveredDataPoint.posts.length > 0 && (
                        <div className="border-t border-gray-100 pt-3">
                          <div className="text-xs font-medium text-gray-700 mb-2">Posts on this date:</div>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {hoveredDataPoint.posts.slice(0, 3).map((post: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2 text-xs">
                                <img
                                  src={post.avatar}
                                  alt={post.influencerName}
                                  className="w-6 h-6 rounded-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{post.influencerName}</div>
                                  <div className="text-gray-500">
                                    {formatNumber(post.views)} views • {formatNumber(post.likes)} likes • {formatNumber(post.comments)} comments
                                  </div>
                                </div>
                              </div>
                            ))}
                            {hoveredDataPoint.posts.length > 3 && (
                              <div className="text-xs text-gray-500 text-center pt-1">
                                +{hoveredDataPoint.posts.length - 3} more post{hoveredDataPoint.posts.length - 3 !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date labels */}
                  <div className="absolute bottom-0 left-0 right-0" style={{ height: '30px' }}>
                    {processedPostsByDate.map((item, index) => {
                      const chartWidth = 70;
                      const chartStart = 15;
                      
                      let leftPercent;
                      if (processedPostsByDate.length === 1) {
                        leftPercent = 50;
                      } else {
                        leftPercent = chartStart + (index / (processedPostsByDate.length - 1)) * chartWidth;
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className="absolute text-xs text-gray-500 font-medium"
                          style={{ 
                            left: `${leftPercent}%`,
                            transform: 'translateX(-50%) translateY(10px) rotate(-45deg)',
                            transformOrigin: 'center center',
                            bottom: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No view data available</p>
                  <p className="text-gray-400 text-xs mt-1">Views will appear here once data is collected</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary stats - UPDATED to use consistent calculations */}
          {processedPostsByDate.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">{formatNumber(totalViewsConsistent)}</div>
                  <div className="text-xs text-gray-500">Total Views</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {Math.max(...processedPostsByDate.map(p => p.views)) > 0 ? 
                      formatNumber(Math.max(...processedPostsByDate.map(p => p.views))) : '0'}
                  </div>
                  <div className="text-xs text-gray-500">Peak Day Views</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {processedPostsByDate.length > 0 ? 
                      formatNumber(Math.round(totalViewsConsistent / processedPostsByDate.length)) : '0'}
                  </div>
                  <div className="text-xs text-gray-500">Avg Views per Day</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedInsights;