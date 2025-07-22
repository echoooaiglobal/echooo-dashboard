// src/components/dashboard/campaign-funnel/result/AnalyticsView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getVideoResults } from '@/services/video-results';
import { VideoResult } from '@/types/user-detailed-info';
import { Campaign } from '@/types/campaign';
import { exportToPDF, exportToPrint, generateExportFilename } from '@/utils/pdfExportUtils';
import PerformanceOverview from './PerformanceOverview';
import DetailedInsights from './DetailedInsights';
import { AnalyticsData } from './types';

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
    totalShares: 0,
    totalFollowers: 0,
    totalPosts: 0,
    totalInfluencers: 0,
    averageEngagementRate: 0,
    totalCPV: 0,
    totalCPE: 0,
    viewsToFollowersRatio: 0,
    commentToViewsRatio: 0,
    postsByDate: [],
    topPerformers: [],
    topPosts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  
  // Sorting and filtering states
  const [postsSortBy, setPostsSortBy] = useState<'views' | 'likes' | 'comments' | 'engagement' | 'date'>('engagement');
  const [postsFilterBy, setPostsFilterBy] = useState<'all' | 'high-engagement' | 'high-views'>('all');
  const [influencersSortBy, setInfluencersSortBy] = useState<'engagement' | 'views' | 'followers' | 'posts'>('engagement');
  const [influencersFilterBy, setInfluencersFilterBy] = useState<'all' | 'verified' | 'top-performers'>('all');
  
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

  // UPDATED: Enhanced getPostData function to match PublishedResults exactly
  const getPostData = (video: VideoResult) => {
    const postData = video.post_result_obj?.data;
    if (!postData) {
      const viewsFromAPI = Math.max(0, video.views_count || 0);
      const playsFromAPI = Math.max(0, video.plays_count || 0);
      const finalViews = Math.max(viewsFromAPI, playsFromAPI);
      const likes = Math.max(0, video.likes_count || 0);
      const comments = Math.max(0, video.comments_count || 0);
      
      // FIXED: Use actual shares data if available, otherwise show 0 (no calculation)
      const shares = Math.max(0, video.shares_count || 0);
      const collaborationPrice = video.collaboration_price || 0;
      
      // UPDATED: Use plays for videoPlayCount when no post data (matching PublishedResults)
      const videoPlayCount = playsFromAPI;
      
      return {
        likes,
        comments,
        views: finalViews, // Keep this for backwards compatibility
        plays: playsFromAPI,
        shares,
        followers: 0,
        engagementRate: 0,
        avatarUrl: getProxiedImageUrl(video.profile_pic_url || ''),
        isVerified: false,
        thumbnailUrl: getProxiedImageUrl(video.thumbnail || video.media_preview || ''),
        collaborationPrice,
        cpv: videoPlayCount > 0 ? collaborationPrice / videoPlayCount : 0, // UPDATED: Use videoPlayCount for CPV
        cpe: (likes + comments + (shares > 0 ? shares : 0)) > 0 ? collaborationPrice / (likes + comments + (shares > 0 ? shares : 0)) : 0,
        videoPlayCount // UPDATED: Added videoPlayCount field
      };
    }

    const likes = Math.max(0, postData.edge_media_preview_like?.count || 
                  postData.edge_liked_by?.count || 
                  video.likes_count || 0);
    
    const comments = Math.max(0, postData.edge_media_to_comment?.count || 
                     postData.edge_media_preview_comment?.count || 
                     postData.edge_media_to_parent_comment?.count ||
                     video.comments_count || 0);
    
    // UPDATED: Focus on video_play_count from API (matching PublishedResults exactly)
    const videoPlayCount = Math.max(0, postData.video_play_count || 0);
    
    // Keep existing logic for other view calculations (for backwards compatibility)
    const videoPlaysFromAPI = Math.max(0, postData.video_view_count || postData.video_play_count || 0);
    const generalViewsFromAPI = Math.max(0, video.views_count || 0);
    const playsFromVideo = Math.max(0, video.plays_count || 0);
    
    const views = Math.max(videoPlaysFromAPI, generalViewsFromAPI, playsFromVideo);
    const plays = Math.max(videoPlaysFromAPI, playsFromVideo);
    
    // FIXED: Use actual shares data from API/manual entry, fallback to 0 (no calculation)
    const shares = Math.max(0, 
      postData.shares_count || // Try from post data
      video.shares_count ||    // Try from video data
      0                        // Default to 0 if no data available
    );
    
    const followers = Math.max(0, postData.owner?.edge_followed_by?.count || 0);
    
    // Calculate engagement rate - only include shares if > 0
    const totalEngagementForRate = likes + comments + (shares > 0 ? shares : 0);
    const engagementRate = followers > 0 ? (totalEngagementForRate / followers) * 100 : 0;
    const collaborationPrice = video.collaboration_price || postData.collaboration_price || 0;
    
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
      views, // Keep this for backwards compatibility
      plays,
      shares,
      followers,
      engagementRate,
      avatarUrl: getProxiedImageUrl(avatarUrl),
      isVerified: postData.owner?.is_verified || false,
      thumbnailUrl: getProxiedImageUrl(thumbnailUrl),
      collaborationPrice,
      cpv: videoPlayCount > 0 ? collaborationPrice / videoPlayCount : 0, // UPDATED: Use videoPlayCount for CPV
      cpe: (likes + comments + (shares > 0 ? shares : 0)) > 0 ? collaborationPrice / (likes + comments + (shares > 0 ? shares : 0)) : 0,
      videoPlayCount // UPDATED: Added videoPlayCount field to match PublishedResults
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

  // Filter and sort functions for posts
  const getFilteredAndSortedPosts = () => {
    let filtered = [...analyticsData.topPosts];
    
    if (postsFilterBy === 'high-engagement') {
      const avgEngagement = filtered.reduce((sum, post) => sum + post.totalEngagement, 0) / filtered.length;
      filtered = filtered.filter(post => post.totalEngagement > avgEngagement);
    } else if (postsFilterBy === 'high-views') {
      // UPDATED: Use videoPlayCount for filtering high-views posts
      const avgViews = filtered.reduce((sum, post) => sum + (post.videoPlayCount || post.views), 0) / filtered.length;
      filtered = filtered.filter(post => (post.videoPlayCount || post.views) > avgViews);
    }
    
    filtered.sort((a, b) => {
      switch (postsSortBy) {
        case 'views':
          // UPDATED: Use videoPlayCount for sorting by views
          return (b.videoPlayCount || b.views) - (a.videoPlayCount || a.views);
        case 'likes':
          return b.likes - a.likes;
        case 'comments':
          return b.comments - a.comments;
        case 'date':
          return new Date(b.postDate).getTime() - new Date(a.postDate).getTime();
        case 'engagement':
        default:
          return b.totalEngagement - a.totalEngagement;
      }
    });
    
    return filtered;
  };

  // Filter and sort functions for influencers
  const getFilteredAndSortedInfluencers = () => {
    let filtered = [...analyticsData.topPerformers];
    
    if (influencersFilterBy === 'verified') {
      filtered = filtered.filter(influencer => influencer.isVerified);
    } else if (influencersFilterBy === 'top-performers') {
      const avgEngagement = filtered.reduce((sum, inf) => sum + inf.totalEngagement, 0) / filtered.length;
      filtered = filtered.filter(inf => inf.totalEngagement > avgEngagement);
    }
    
    filtered.sort((a, b) => {
      switch (influencersSortBy) {
        case 'views':
          // UPDATED: Use totalVideoPlayCount for sorting by views (will be added in processing)
          return (b.totalVideoPlayCount || b.totalViews) - (a.totalVideoPlayCount || a.totalViews);
        case 'followers':
          return b.followers - a.followers;
        case 'posts':
          return b.totalPosts - a.totalPosts;
        case 'engagement':
        default:
          return b.totalEngagement - a.totalEngagement;
      }
    });
    
    return filtered;
  };

  const handleShareReport = async () => {
    if (!campaignData?.id || !campaignData?.name) {
      console.error('No campaign data available for sharing');
      alert('Campaign data is not available for sharing.');
      return;
    }
    
    setIsSharing(true);
    
    try {
      const shareId = `${campaignData.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const requestBody = {
        shareId,
        campaignId: campaignData.id,
        campaignName: campaignData.name,
        analyticsData,
        createdAt: new Date().toISOString(),
        expiresAt
      };
      
      const response = await fetch('/api/shared-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create shared report');
      }

      const result = await response.json();
      
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/campaign-analytics-report/${campaignData.id}`;
      
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (clipboardError) {
        console.warn('Clipboard copy failed:', clipboardError);
      }
      
      alert(`Share link created and copied to clipboard!\n\n${shareUrl}\n\nThis link allows public access to the campaign analytics without requiring login.`);
      
      window.open(shareUrl, '_blank');
      
    } catch (error) {
      console.error('Error sharing report:', error);
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

        // Initialize totals
        let totalLikes = 0;
        let totalComments = 0;
        let totalViews = 0; // This will be based on videoPlayCount for consistency
        let totalShares = 0;
        let totalFollowers = 0;
        
        // NEW: Track collaboration price metrics
        let totalCollaborationPrice = 0;
        let postsWithCollaborationPrice = 0;

        // For calculating average engagement rate
        let totalEngagementRate = 0;
        let influencersWithFollowers = 0;

        // Enhanced date processing for posts by date chart
        const postDateMap = new Map<string, {
          count: number;
          views: number;
          posts: Array<{
            influencerName: string;
            username: string;
            avatar: string;
            views: number;
            likes: number;
            comments: number;
            shares: number;
          }>;
        }>();

        const influencerPerformanceData: Array<{
          name: string;
          username: string;
          avatar: string;
          clicks: number;
          isVerified: boolean;
          totalPosts: number;
          totalLikes: number;
          totalComments: number;
          totalViews: number;
          totalVideoPlayCount: number; // UPDATED: Added for consistency with PublishedResults
          totalShares: number;
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
          videoPlayCount: number; // UPDATED: Added videoPlayCount field
          plays: number;
          shares: number;
          engagementRate: number;
          isVerified: boolean;
          postId: string;
          totalEngagement: number;
          postDate: string;
          collaborationPrice: number; // NEW: Added collaboration price
        }> = [];

        // Process each unique influencer
        influencerGroups.forEach((videos, username) => {
          let influencerTotalLikes = 0;
          let influencerTotalComments = 0;
          let influencerTotalViews = 0;
          let influencerTotalVideoPlayCount = 0; // UPDATED: Track videoPlayCount separately
          let influencerTotalShares = 0;
          let influencerFollowers = 0;
          let influencerAvatar = '';
          let influencerName = '';
          let isVerified = false;

          videos.forEach(video => {
            const postDataDetail = getPostData(video);
            
            // Sum post metrics
            totalLikes += postDataDetail.likes;
            totalComments += postDataDetail.comments;
            // UPDATED: Use videoPlayCount for totalViews calculation
            totalViews += postDataDetail.videoPlayCount || postDataDetail.views;
            totalShares += postDataDetail.shares;
            
            // NEW: Track collaboration prices
            if (postDataDetail.collaborationPrice > 0) {
              totalCollaborationPrice += postDataDetail.collaborationPrice;
              postsWithCollaborationPrice++;
            }
            
            influencerTotalLikes += postDataDetail.likes;
            influencerTotalComments += postDataDetail.comments;
            influencerTotalViews += postDataDetail.views; // Keep original views for backwards compatibility
            influencerTotalVideoPlayCount += postDataDetail.videoPlayCount || 0; // UPDATED: Track videoPlayCount
            influencerTotalShares += postDataDetail.shares;
            
            // Take the maximum followers count for this influencer
            if (postDataDetail.followers > influencerFollowers) {
              influencerFollowers = postDataDetail.followers;
            }

            if (!influencerName || video.full_name) {
              influencerName = video.full_name || video.influencer_username;
              influencerAvatar = postDataDetail.avatarUrl;
              isVerified = postDataDetail.isVerified;
            }

            // Enhanced date processing - UPDATED: Use videoPlayCount for views
            let postDate = null;
            if (video.post_created_at) {
              postDate = video.post_created_at;
            } else if (video.created_at) {
              postDate = video.created_at;
            }
            
            const postViews = postDataDetail.videoPlayCount || postDataDetail.views;
            if (postDate && postViews > 0) {
              try {
                const dateKey = new Date(postDate).toISOString().split('T')[0];
                const existing = postDateMap.get(dateKey) || { count: 0, views: 0, posts: [] };
                
                postDateMap.set(dateKey, {
                  count: existing.count + 1,
                  views: existing.views + postViews, // UPDATED: Use postViews (videoPlayCount or fallback)
                  posts: [
                    ...existing.posts,
                    {
                      influencerName: video.full_name || video.influencer_username,
                      username: video.influencer_username,
                      avatar: postDataDetail.avatarUrl,
                      views: postViews, // UPDATED: Use postViews
                      likes: postDataDetail.likes,
                      comments: postDataDetail.comments,
                      shares: postDataDetail.shares,
                    }
                  ]
                });
              } catch (dateError) {
                console.warn('Invalid date for video:', video.id, postDate);
              }
            }

            const totalEngagement = postDataDetail.likes + postDataDetail.comments + (postDataDetail.shares > 0 ? postDataDetail.shares : 0);
            allPostsData.push({
              id: video.id,
              influencerName: video.full_name || video.influencer_username,
              username: video.influencer_username,
              avatar: postDataDetail.avatarUrl,
              thumbnail: postDataDetail.thumbnailUrl,
              likes: postDataDetail.likes,
              comments: postDataDetail.comments,
              views: postDataDetail.views,
              videoPlayCount: postDataDetail.videoPlayCount || 0, // UPDATED: Add videoPlayCount field
              plays: postDataDetail.plays,
              shares: postDataDetail.shares,
              engagementRate: postDataDetail.engagementRate,
              isVerified: postDataDetail.isVerified,
              postId: video.post_result_obj?.data?.shortcode || video.post_id,
              totalEngagement,
              postDate: video.post_created_at || video.created_at,
              collaborationPrice: postDataDetail.collaborationPrice // NEW: Added collaboration price
            });
          });

          // Add unique influencer followers to total
          totalFollowers += influencerFollowers;

          // Calculate individual influencer engagement rate
          let avgEngagementRate = 0;
          if (influencerFollowers > 0) {
            const influencerTotalEngagement = influencerTotalLikes + influencerTotalComments + (influencerTotalShares > 0 ? influencerTotalShares : 0);
            avgEngagementRate = (influencerTotalEngagement / influencerFollowers) * 100;
            totalEngagementRate += avgEngagementRate;
            influencersWithFollowers++;
          }

          const influencerTotalEngagement = influencerTotalLikes + influencerTotalComments + (influencerTotalShares > 0 ? influencerTotalShares : 0);
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
            totalViews: influencerTotalViews,
            totalVideoPlayCount: influencerTotalVideoPlayCount, // UPDATED: Add videoPlayCount tracking
            totalShares: influencerTotalShares,
            avgEngagementRate,
            totalEngagement: influencerTotalEngagement,
            followers: influencerFollowers
          });
        });

        // Convert posts by date to array with proper sorting and cumulative calculation
        const sortedPostsByDate = Array.from(postDateMap.entries())
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let cumulativeViews = 0;
        const postsByDate = sortedPostsByDate.map(item => {
          cumulativeViews += item.views;
          return {
            date: item.date,
            count: item.count,
            views: item.views,
            cumulativeViews: cumulativeViews,
            posts: item.posts
          };
        });

        const topPerformers = influencerPerformanceData
          .sort((a, b) => b.totalEngagement - a.totalEngagement);

        const topPosts = allPostsData
          .sort((a, b) => b.totalEngagement - a.totalEngagement)
          .slice(0, 20);

        const totalPosts = results.length;
        const totalInfluencers = influencerGroups.size;
        
        // Calculate average engagement rate using industry standard formula
        const totalEngagement = totalLikes + totalComments + (totalShares > 0 ? totalShares : 0);
        const averageEngagementRate = totalFollowers > 0 ? (totalEngagement / totalFollowers) * 100 : 0;
        
        // Calculate clicks (typically 2-5% of total engagement)
        const totalClicks = Math.round(totalEngagement * 0.03);
        
        // Calculate impressions using industry standard formulas
        const videoPosts = results.filter(video => {
          const postData = getPostData(video);
          return (postData.videoPlayCount || postData.views) > 0 || postData.plays > 0;
        }).length;
        const photoPosts = totalPosts - videoPosts;
        
        // UPDATED: Use totalViews (which is now based on videoPlayCount) for impression calculation
        const videoImpressions = Math.round(totalViews * 1.3);
        const photoImpressions = Math.round((photoPosts * totalFollowers * 0.4) / totalInfluencers);
        const totalImpressions = videoImpressions + photoImpressions;
        
        // Calculate reach (unique users who saw content) - UPDATED: Use new totalViews
        const estimatedReach = Math.round(totalImpressions * 0.65);
        const totalReach = Math.min(estimatedReach, Math.max(totalViews, totalImpressions * 0.5));

        // Calculate new metrics - UPDATED: Use new totalViews for ratios
        const viewsToFollowersRatio = totalFollowers > 0 ? (totalViews / totalFollowers) * 100 : 0;
        const commentToViewsRatio = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

        // NEW: Calculate CPV and CPE based on total collaboration price
        const newTotalCPV = totalViews > 0 ? totalCollaborationPrice / totalViews : 0;
        const newTotalCPE = totalEngagement > 0 ? totalCollaborationPrice / totalEngagement : 0;

        console.log('💰 AnalyticsView Collaboration Metrics:');
        console.log(`Total collaboration price: ${totalCollaborationPrice.toFixed(2)}`);
        console.log(`Posts with collaboration price: ${postsWithCollaborationPrice}`);
        console.log(`New Total CPV: ${newTotalCPV.toFixed(4)}`);
        console.log(`New Total CPE: ${newTotalCPE.toFixed(4)}`);

        setAnalyticsData({
          totalClicks,
          totalImpressions,
          totalReach,
          totalLikes,
          totalComments,
          totalViews, // This is now based on videoPlayCount for consistency
          totalShares,
          totalFollowers,
          totalPosts,
          totalInfluencers,
          averageEngagementRate,
          totalCPV: newTotalCPV, // UPDATED: Use new calculation based on collaboration prices
          totalCPE: newTotalCPE, // UPDATED: Use new calculation based on collaboration prices
          viewsToFollowersRatio,
          commentToViewsRatio,
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

  return (
    <div className="pt-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      {/* Header with Back and Export Buttons */}
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      {/* Content to be exported */}
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
                        Total number of unique influencers participating in this campaign. Each creator is counted only once, regardless of how many posts they published.
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Overview Section */}
        <PerformanceOverview analyticsData={analyticsData} />

        {/* Detailed Insights Section */}
        <DetailedInsights analyticsData={analyticsData} />

        {/* Top Performing Posts Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Top Performing Posts</h3>
              <div className="flex items-center space-x-4">
                {/* Posts Filters */}
                <div className="flex items-center space-x-2 no-print">
                  <select
                    value={postsFilterBy}
                    onChange={(e) => setPostsFilterBy(e.target.value as any)}
                    className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Posts</option>
                    <option value="high-engagement">High Engagement</option>
                    <option value="high-views">High Views</option>
                  </select>
                  <select
                    value={postsSortBy}
                    onChange={(e) => setPostsSortBy(e.target.value as any)}
                    className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="engagement">Sort by Engagement</option>
                    <option value="views">Sort by Views</option>
                    <option value="likes">Sort by Likes</option>
                    <option value="comments">Sort by Comments</option>
                    <option value="date">Sort by Date</option>
                  </select>
                </div>
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(() => {
                const filteredAndSortedPosts = getFilteredAndSortedPosts();
                return filteredAndSortedPosts.length > 0 ? (
                  filteredAndSortedPosts.map((post, index) => (
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
                    <span className="text-xs font-medium text-gray-700">{post.username}</span>
                    {post.isVerified && (
                      <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Stats grid - Show shares only if > 0 */}
                  <div className={`grid gap-1 text-xs ${post.shares > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {/* UPDATED: Display videoPlayCount if available, otherwise fall back to views */}
                        <span className="font-medium text-gray-700">{formatNumber(Math.max(0, post.videoPlayCount || post.views))}</span>
                      </div>
                    </div>
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
                    {/* Only show shares if post has shares > 0 */}
                    {post.shares > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span className="font-medium text-gray-700">{formatNumber(post.shares)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No posts found with current filters</p>
            </div>
          );
        })()}
      </div>
    </div>
  </div>

  {/* Top Performing Influencers Section */}
  <div className="mb-0">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Top Performing Influencers</h3>
        <div className="flex items-center space-x-4">
          {/* Influencers Filters */}
          <div className="flex items-center space-x-2 no-print">
            <select
              value={influencersFilterBy}
              onChange={(e) => setInfluencersFilterBy(e.target.value as any)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Influencers</option>
              <option value="verified">Verified Only</option>
              <option value="top-performers">Top Performers</option>
            </select>
            <select
              value={influencersSortBy}
              onChange={(e) => setInfluencersSortBy(e.target.value as any)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="engagement">Sort by Engagement</option>
              <option value="views">Sort by Views</option>
              <option value="followers">Sort by Followers</option>
              <option value="posts">Sort by Posts</option>
            </select>
          </div>
          <div className="relative group">
            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="relative">
                All influencers ranked by total engagement (likes + comments + shares). Shows which creators generated the most interaction with their audience and delivered the best performance for your campaign.
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {(() => {
          const filteredAndSortedInfluencers = getFilteredAndSortedInfluencers();
          return filteredAndSortedInfluencers.length > 0 ? (
            filteredAndSortedInfluencers.map((influencer, index) => (
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
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{influencer.name}</h4>
                  <p className="text-xs text-gray-500">@{influencer.username}</p>
                </div>
                
                {/* Stats Grid */}
                <div className="space-y-3">
                  {/* Main metric - Followers */}
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{formatNumber(influencer.followers)}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Engagement */}
                    <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                      <div className="text-sm font-semibold text-gray-900">{formatNumber(influencer.totalEngagement)}</div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                      {/* UPDATED: Display totalVideoPlayCount if available, otherwise fall back to totalViews */}
                      <div className="text-sm font-semibold text-gray-900">{formatNumber(Math.max(0, influencer.totalVideoPlayCount || influencer.totalViews))}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                      <div className="text-sm font-semibold text-gray-900">{influencer.totalPosts}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                      <div className="text-sm font-semibold text-gray-900">{influencer.avgEngagementRate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">Eng Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No influencers found with current filters</p>
            </div>
          );
        })()}
      </div>
    </div>
  </div>
</div>
</div>
);
};

export default AnalyticsView;