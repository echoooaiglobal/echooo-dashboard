// src/components/dashboard/campaign-funnel/result/PublishedResults.tsx
'use client';

import { useState, useEffect } from 'react';
import AddVideoModal from './AddVideoModal';
import { getVideoResults, updateVideoResult, updateAllVideoResultsWithData, deleteVideoResult } from '@/services/video-results';
import { getInstagramPostDetails, mapToBackendFormat } from '@/services/ensembledata/user-detailed-info';
import { VideoResult } from '@/types/user-detailed-info';
import { Campaign } from '@/services/campaign/campaign.service';
import { formatNumber } from '@/utils/format';

interface PublishedResultsProps {
  campaignData?: Campaign | null;
  onShowAnalytics?: () => void;
  onVideoCountChange?: (count: number) => void;
}

const PublishedResults: React.FC<PublishedResultsProps> = ({ 
  campaignData, 
  onShowAnalytics, 
  onVideoCountChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [updatingVideoId, setUpdatingVideoId] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoData, setSelectedVideoData] = useState<VideoResult | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  // Image proxy utility function
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

  // Format date utility function
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format relative time utility function
  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMilliseconds = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return '1 day ago';
      } else if (diffInDays < 30) {
        return `${diffInDays} days ago`;
      } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
      } else {
        const years = Math.floor(diffInDays / 365);
        return years === 1 ? '1 year ago' : `${years} years ago`;
      }
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Update parent component with video count whenever videoResults changes
  useEffect(() => {
    if (onVideoCountChange) {
      onVideoCountChange(videoResults.length);
    }
  }, [videoResults.length, onVideoCountChange]);

  // Fetch video results on component mount
  useEffect(() => {
    if (campaignData?.id) {
      fetchVideoResults();
    }
  }, [campaignData?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPageSizeDropdown) {
        const target = event.target as Element;
        if (!target.closest('.page-size-dropdown')) {
          setShowPageSizeDropdown(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPageSizeDropdown]);

  const fetchVideoResults = async () => {
    if (!campaignData?.id) return;
    
    setIsLoading(true);
    try {
      console.log('🔍 Fetching video results for campaign:', campaignData.id);
      const results = await getVideoResults(campaignData.id);
      setVideoResults(results);
      console.log('✅ Fetched video results:', results.length);
    } catch (error) {
      console.error('💥 Error fetching video results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSingleVideo = async (videoResult: VideoResult) => {
    setUpdatingVideoId(videoResult.id);
    try {
      console.log('🔄 Updating single video:', videoResult.id);
      
      let postInput: { url?: string; code?: string } = {};
      
      if (videoResult.post_result_obj && videoResult.post_result_obj.data && videoResult.post_result_obj.data.shortcode) {
        postInput.code = videoResult.post_result_obj.data.shortcode;
      } else {
        postInput.code = videoResult.post_id;
      }
      
      const freshInstagramData = await getInstagramPostDetails(postInput);

      if (!freshInstagramData.success) {
        throw new Error(freshInstagramData.message || 'Failed to fetch updated Instagram data');
      }

      const backendData = mapToBackendFormat(freshInstagramData, videoResult.campaign_id);
      const updatedResult = await updateVideoResult(videoResult.id, backendData);

      setVideoResults(prev => 
        prev.map(video => 
          video.id === videoResult.id ? updatedResult : video
        )
      );

      console.log('✅ Video updated successfully:', updatedResult.id);
    } catch (error) {
      console.error('💥 Error updating video:', error);
    } finally {
      setUpdatingVideoId(null);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    setDeletingVideoId(videoId);
    try {
      console.log('🗑️ Deleting video:', videoId);
      
      await deleteVideoResult(videoId);
      
      // Remove the video from local state
      setVideoResults(prev => prev.filter(video => video.id !== videoId));
      
      // Clear any selection that includes this video
      setSelectedVideos(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(videoId);
        return newSelected;
      });
      
      console.log('✅ Video deleted successfully:', videoId);
    } catch (error) {
      console.error('💥 Error deleting video:', error);
      // You might want to show a toast notification here
    } finally {
      setDeletingVideoId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleUpdateAllVideos = async () => {
    if (!campaignData?.id) return;
    
    setIsUpdatingAll(true);
    try {
      console.log('🔄 Updating all videos for campaign:', campaignData.id);
      console.log('📊 Total videos to update:', videoResults.length);
      
      const updatesData = [];
      
      for (let i = 0; i < videoResults.length; i++) {
        const video = videoResults[i];
        console.log(`🔄 Processing ${i + 1}/${videoResults.length}: ${video.influencer_username}`);
        
        try {
          let postInput: { url?: string; code?: string } = {};
          
          if (video.post_result_obj && video.post_result_obj.data && video.post_result_obj.data.shortcode) {
            postInput.code = video.post_result_obj.data.shortcode;
          } else {
            postInput.code = video.post_id;
          }
          
          const freshInstagramData = await getInstagramPostDetails(postInput);

          if (!freshInstagramData.success) {
            console.warn(`⚠️ Failed to fetch fresh data for ${video.influencer_username}: ${freshInstagramData.message}`);
            continue;
          }

          const backendData = mapToBackendFormat(freshInstagramData, video.campaign_id);
          
          updatesData.push({
            result_id: video.id,
            update_data: {
              user_ig_id: backendData.user_ig_id,
              full_name: backendData.full_name,
              influencer_username: backendData.influencer_username,
              profile_pic_url: backendData.profile_pic_url,
              post_id: backendData.post_id,
              title: backendData.title,
              views_count: backendData.view_counts,
              plays_count: backendData.play_counts,
              likes_count: backendData.comment_counts,
              comments_count: backendData.comment_counts,
              media_preview: backendData.media_preview,
              duration: backendData.duration,
              thumbnail: backendData.thumbnail,
              post_created_at: backendData.post_created_at,
              post_result_obj: backendData.post_result_obj
            }
          });
          
          console.log(`✅ Prepared update data for ${video.influencer_username}`);
          
        } catch (error) {
          console.error(`💥 Error preparing update for ${video.influencer_username}:`, error);
        }
      }
      
      console.log(`📦 Prepared ${updatesData.length} updates out of ${videoResults.length} videos`);
      
      if (updatesData.length === 0) {
        throw new Error('No videos could be prepared for update');
      }
      
      const updatedResults = await updateAllVideoResultsWithData(campaignData.id, updatesData);
      setVideoResults(updatedResults);
      
      console.log('✅ All videos updated successfully:', updatedResults.length);
    } catch (error) {
      console.error('💥 Error updating all videos:', error);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const toggleVideoSelection = (id: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedVideos(newSelected);
  };

  const filteredVideos = videoResults.filter(video =>
    video.influencer_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPostData = (video: VideoResult) => {
    const postData = video.post_result_obj?.data;
    if (!postData) return {
      likes: video.likes_count || 0,
      comments: video.comments_count || 0,
      views: video.views_count || 0,
      plays: video.plays_count || 0,
      followers: 0,
      engagementRate: '0%',
      videoUrl: null,
      thumbnailUrl: getProxiedImageUrl(video.thumbnail || video.media_preview || ''),
      isVideo: false,
      duration: video.duration || 0
    };

    const likes = postData.edge_media_preview_like?.count || 
                  postData.edge_liked_by?.count || 
                  video.likes_count || 0;
    
    const comments = postData.edge_media_to_comment?.count || 
                     postData.edge_media_preview_comment?.count || 
                     postData.edge_media_to_parent_comment?.count ||
                     video.comments_count || 0;
    
    // Separate video_view_count and video_play_count
    const views = postData.video_view_count || video.views_count || 0;
    const plays = postData.video_play_count || video.plays_count || 0;
    
    const followers = postData.owner?.edge_followed_by?.count || 0;
    const engagementRate = followers > 0 ? (((likes + comments) / followers) * 100).toFixed(2) + '%' : '0%';
    
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
    
    if (thumbnailUrl && !thumbnailUrl.startsWith('/api/') && !thumbnailUrl.startsWith('/user/')) {
      if (thumbnailUrl.includes('instagram.com') || thumbnailUrl.includes('fbcdn.net') || thumbnailUrl.includes('cdninstagram.com')) {
        thumbnailUrl = `/api/v0/instagram/image-proxy?url=${encodeURIComponent(thumbnailUrl)}`;
      }
    }
    
    const videoUrl = postData.video_url || null;
    
    return {
      likes,
      comments,
      views,
      plays,
      followers,
      engagementRate,
      videoUrl,
      thumbnailUrl,
      isVideo: postData.is_video || postData.__typename === 'GraphVideo',
      duration: postData.video_duration || video.duration || 0
    };
  };

  const handleVideoClick = (video: VideoResult) => {
    const postData = getPostData(video);
    
    if (postData.isVideo && postData.videoUrl) {
      setSelectedVideoData(video);
      setVideoModalOpen(true);
    } else {
      const shortcode = video.post_result_obj?.data?.shortcode || video.post_id;
      if (shortcode) {
        window.open(`https://www.instagram.com/p/${shortcode}/`, '_blank');
      }
    }
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedVideoData(null);
  };

  // Pagination calculations
  const totalItems = filteredVideos.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    setShowPageSizeDropdown(false);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3);
        if (totalPages > 4) pages.push('...');
        if (totalPages > 3) pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        if (totalPages > 4) pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();
  const pageSizeOptions = [10, 20, 25, 50, 100];

  return (
    <div className="pt-4">
      {/* Search Bar and Action Buttons */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="relative flex-1 mr-6">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => setShowAddVideoModal(true)}
            disabled={!campaignData?.id}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all duration-200 text-sm font-medium shadow-lg min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Video
          </button>
          
          <button
            onClick={handleUpdateAllVideos}
            disabled={isUpdatingAll || videoResults.length === 0}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full hover:from-blue-500 hover:to-blue-600 transition-all duration-200 text-sm font-medium shadow-lg min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingAll ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update All
              </>
            )}
          </button>
          
          <button 
            onClick={onShowAnalytics}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 rounded-full hover:from-pink-200 hover:to-rose-200 transition-all duration-200 text-sm font-medium min-w-[150px]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
            </svg>
            View Analytics
          </button>
          
          <button className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors duration-200 min-w-[60px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-pink-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Loading video results...</p>
          </div>
        </div>
      )}

      {/* No Campaign State */}
      {!campaignData?.id && !isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No campaign selected</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && campaignData?.id && (
        <div className="bg-white rounded-lg shadow w-full relative">
          <div className="w-full min-w-full table-fixed">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    <span className="truncate">Post ({totalItems})</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Followers</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Likes</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Comments</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Views</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Plays</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Eng Rate</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Post Date</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Added Date</span>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <span className="truncate">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVideos.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500">No video results found</p>
                      <p className="text-sm text-gray-400 mt-1">Add videos to see them here</p>
                    </td>
                  </tr>
                ) : (
                  paginatedVideos.map((video) => {
                    const postData = getPostData(video);
                    const isPlaying = playingVideo === video.id;
                    
                    return (
                      <tr key={video.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 relative">
                              {isPlaying && postData.videoUrl ? (
                                <div className="w-16 h-12 rounded-lg overflow-hidden">
                                  <video
                                    src={postData.videoUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay
                                    onEnded={() => setPlayingVideo(null)}
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="relative group cursor-pointer"
                                  onClick={() => handleVideoClick(video)}
                                >
                                  <img
                                    src={postData.thumbnailUrl}
                                    alt={`${video.influencer_username} video`}
                                    className="w-16 h-12 rounded-lg object-cover shadow-md ring-1 ring-gray-200 group-hover:shadow-lg transition-all duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/dummy-image.jpg';
                                    }}
                                  />
                                  
                                  {/* Play button overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                                      <svg className="w-3 h-3 text-pink-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>
                                  
                                  {/* Duration badge */}
                                  {postData.duration > 0 && (
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                      {Math.floor(postData.duration)}s
                                    </div>
                                  )}
                                  
                                  {/* Instagram indicator */}
                                  <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-sm">
                                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-3 min-w-0 flex-1">
                              <div className="text-xs font-medium text-gray-900 flex items-center">
                                <span className="truncate">{video.full_name || video.influencer_username}</span>
                                {video.post_result_obj?.data?.owner?.is_verified && (
                                  <span className="ml-1 flex-shrink-0 text-blue-500" title="Verified">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path fillRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500 truncate">@{video.influencer_username}</p>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Stats */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {postData.followers > 0 ? formatNumber(postData.followers) : 'N/A'}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(postData.likes)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(postData.comments)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {postData.views > 0 ? formatNumber(postData.views) : 'N/A'}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {postData.plays > 0 ? formatNumber(postData.plays) : 'N/A'}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {postData.engagementRate}
                        </td>

                        {/* Post Date */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium">{video.post_created_at? formatDate(video.post_created_at): 'N/A'}</span>
                            <span className="text-xs text-gray-400">{video.post_created_at? formatRelativeTime(video.post_created_at): 'N/A'}</span>
                          </div>
                        </td>

                        {/* Added Date */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(video.created_at)}</span>
                            <span className="text-xs text-gray-400">{formatRelativeTime(video.created_at)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateSingleVideo(video)}
                              disabled={updatingVideoId === video.id}
                              className="text-blue-500 hover:text-blue-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-blue-50"
                              title="Update video data"
                            >
                              {updatingVideoId === video.id ? (
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                            </button>
                            
                            <button
                              onClick={() => {
                                const shortcode = video.post_result_obj?.data?.shortcode;
                                if (shortcode) {
                                  window.open(`https://www.instagram.com/p/${shortcode}/`, '_blank');
                                }
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded hover:bg-gray-50"
                              title="View on Instagram"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>

                            <button
                              onClick={() => setShowDeleteConfirm(video.id)}
                              disabled={deletingVideoId === video.id}
                              className="text-red-500 hover:text-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-red-50"
                              title="Delete video"
                            >
                              {deletingVideoId === video.id ? (
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
              <div className="flex items-center mb-4 sm:mb-0">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {pageNumbers.map((pageNum, index) => (
                    <div key={index}>
                      {pageNum === '...' ? (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(pageNum as number)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            pageNum === currentPage
                              ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )}
                    </div>
                  ))}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
              
              <div className="flex items-center">
                <p className="text-sm text-gray-700 mr-3">
                  Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> entries
                </p>
                <div className="ml-2 relative page-size-dropdown">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPageSizeDropdown(!showPageSizeDropdown);
                    }}
                    className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center"
                  >
                    Show {pageSize}
                    <svg className={`-mr-1 ml-1 h-5 w-5 transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showPageSizeDropdown && (
                    <div className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {pageSizeOptions.map((option) => (
                          <button
                            key={option}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePageSizeChange(option);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                              pageSize === option ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            Show {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Video Result
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this video result? This action cannot be undone and will permanently remove all associated data.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteVideo(showDeleteConfirm)}
                  disabled={deletingVideoId === showDeleteConfirm}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deletingVideoId === showDeleteConfirm ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoModalOpen && selectedVideoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={getProxiedImageUrl(selectedVideoData.profile_pic_url || selectedVideoData.post_result_obj?.data?.owner?.profile_pic_url || '')}
                    alt={`${selectedVideoData.influencer_username} profile`}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                    </svg>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center">
                    <p className="font-medium text-sm truncate">{selectedVideoData.full_name || selectedVideoData.influencer_username}</p>
                    {selectedVideoData.post_result_obj?.data?.owner?.is_verified && (
                      <span className="ml-1 flex-shrink-0 text-blue-500" title="Verified">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">@{selectedVideoData.influencer_username}</p>
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center">
              {(() => {
                const postData = getPostData(selectedVideoData);
                return postData.videoUrl ? (
                  <video
                    src={postData.videoUrl}
                    className="w-full h-auto max-h-[50vh] object-contain"
                    controls
                    autoPlay
                    muted
                    onError={(e) => {
                      console.error('Video play error in modal:', e);
                    }}
                  />
                ) : (
                  <div className="text-white text-center p-8 w-full">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-4 text-lg">Video not available for playback</p>
                    <p className="mb-6 text-sm text-gray-300">Due to Instagram's restrictions, this video cannot be played directly.</p>
                    <button
                      onClick={() => {
                        const shortcode = selectedVideoData.post_result_obj?.data?.shortcode || selectedVideoData.post_id;
                        if (shortcode) {
                          window.open(`https://www.instagram.com/p/${shortcode}/`, '_blank');
                        }
                      }}
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
                    >
                      View on Instagram
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {(() => {
                  const postData = getPostData(selectedVideoData);
                  return (
                    <>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{formatNumber(postData.likes)}</p>
                        <p className="text-gray-500">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{formatNumber(postData.comments)}</p>
                        <p className="text-gray-500">Comments</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{postData.views > 0 ? formatNumber(postData.views) : 'N/A'}</p>
                        <p className="text-gray-500">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{postData.plays > 0 ? formatNumber(postData.plays) : 'N/A'}</p>
                        <p className="text-gray-500">Plays</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              {selectedVideoData.post_result_obj?.data?.edge_media_to_caption?.edges?.[0]?.node?.text && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {selectedVideoData.post_result_obj.data.edge_media_to_caption.edges[0].node.text}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideoModal && campaignData?.id && (
        <AddVideoModal 
          campaignId={campaignData.id}
          onClose={() => setShowAddVideoModal(false)}
          onSubmit={(videoData) => {
            console.log('Video added:', videoData);
            setShowAddVideoModal(false);
            fetchVideoResults();
          }}
        />
      )}
    </div>
  );
};

export default PublishedResults;