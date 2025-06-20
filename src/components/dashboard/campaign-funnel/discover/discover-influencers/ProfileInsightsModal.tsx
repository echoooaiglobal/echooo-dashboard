// src/components/dashboard/campaign-funnel/discover/discover-influencers/ProfileInsightsModal.tsx
import React, { useState, useEffect } from 'react';
import { Influencer } from '@/types/insights-iq';
import { checkProfileAnalyticsExists } from '@/services/profile-analytics';
import { ProfileAnalyticsExistsResponse } from '@/types/profile-analytics';

interface ProfileInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: Influencer | null;
  onFetchPosts?: (influencer: Influencer) => Promise<any[]>; // Function to fetch posts
}

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  views?: number;
  createdAt: string;
  type: 'image' | 'video' | 'carousel';
}

const ProfileInsightsModal: React.FC<ProfileInsightsModalProps> = ({
  isOpen,
  onClose,
  influencer,
  onFetchPosts
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts'>('overview');
  
  // New state for analytics check
  const [analyticsData, setAnalyticsData] = useState<ProfileAnalyticsExistsResponse | null>(null);
  const [checkingAnalytics, setCheckingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Fetch posts when modal opens and influencer changes
  useEffect(() => {
    if (isOpen && influencer && onFetchPosts && activeTab === 'posts') {
      setLoadingPosts(true);
      onFetchPosts(influencer)
        .then((fetchedPosts) => {
          setPosts(fetchedPosts || []);
        })
        .catch((error) => {
          console.error('Failed to fetch posts:', error);
          setPosts([]);
        })
        .finally(() => {
          setLoadingPosts(false);
        });
    }
  }, [isOpen, influencer, onFetchPosts, activeTab]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPosts([]);
      setActiveTab('overview');
      setAnalyticsData(null);
      setAnalyticsError(null);
    }
  }, [isOpen]);

  if (!isOpen || !influencer) return null;

  const formatNumber = (num: number | string | undefined) => {
    if (!num) return 'N/A';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return 'N/A';
    if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`;
    if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}K`;
    return numValue.toLocaleString();
  };

  const formatEngagementRate = (rate: number | string | undefined) => {
    if (!rate) return 'N/A';
    const numValue = typeof rate === 'string' ? parseFloat(rate) : rate;
    if (isNaN(numValue)) return 'N/A';
    return `${(numValue * 100).toFixed(2)}%`;
  };

  const handleOpenProfile = () => {
    if (influencer.url) {
      window.open(influencer.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Updated handleProfileAnalytics to check analytics existence
  const handleProfileAnalytics = async () => {
    try {
      console.log('🔍 Profile Analytics clicked for:', influencer.username);
      
      // Get platform account ID from influencer
      const platformAccountId = influencer.external_id || influencer.id;
      
      if (!platformAccountId) {
        console.error('❌ No platform account ID found for influencer');
        setAnalyticsError('Unable to find platform account ID');
        return;
      }

      console.log('📊 Platform Account ID:', platformAccountId);
      
      setCheckingAnalytics(true);
      setAnalyticsError(null);
      
      // Call the API to check if analytics exist
      const response = await checkProfileAnalyticsExists(platformAccountId);
      
      console.log('✅ Analytics check response:', response);
      setAnalyticsData(response);
      
      // TODO: Based on response, decide what to do next
      if (response.exists) {
        console.log(`📈 Analytics exist! Count: ${response.analytics_count}, Latest: ${response.latest_analytics_date}`);
        // TODO: Navigate to analytics page or show analytics data
        alert(`Analytics available! ${response.analytics_count} reports found. Latest: ${new Date(response.latest_analytics_date).toLocaleDateString()}`);
      } else {
        console.log('📭 No analytics found for this influencer');
        // TODO: Show message or trigger analytics generation
        alert('No analytics reports found for this influencer.');
      }
      
    } catch (error) {
      console.error('💥 Error checking profile analytics:', error);
      setAnalyticsError(error instanceof Error ? error.message : 'Failed to check analytics');
    } finally {
      setCheckingAnalytics(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with opacity */}
        <div 
          className="fixed inset-0 bg-black transition-opacity"
          onClick={onClose}
          style={{ opacity: '50%' }}
        ></div>

        {/* Modal panel - Mobile-like width */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full max-w-sm w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profile Insights
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="px-6 pb-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                  src={influencer.profileImage || '/user/profile-placeholder.png'}
                  alt={influencer.username}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                  }}
                />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-center space-x-2">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {influencer.name || influencer.username}
                  </h2>
                  {influencer.isVerified && (
                    <span className="text-blue-500" title="Verified">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">@{influencer.username}</p>
                {influencer.introduction && (
                  <p className="text-sm text-gray-700 mt-2 px-2">{influencer.introduction}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 mt-4">
              <button
                onClick={handleOpenProfile}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                View Profiles
              </button>
              <button
                onClick={handleProfileAnalytics}
                disabled={checkingAnalytics}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {checkingAnalytics ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking Analytics...
                  </>
                ) : (
                  'Profile Analytics'
                )}
              </button>
              
              {/* Show analytics error if any */}
              {analyticsError && (
                <div className="text-xs text-red-600 text-center mt-1">
                  {analyticsError}
                </div>
              )}
              
              {/* Show analytics status if available */}
              {analyticsData && !checkingAnalytics && (
                <div className="text-xs text-gray-600 text-center mt-1">
                  {analyticsData.exists 
                    ? `${analyticsData.analytics_count} analytics reports available`
                    : 'No analytics reports found'
                  }
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-gray-900">{formatNumber(influencer.followers)}</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-gray-900">{formatEngagementRate(influencer.engagementRate)}</div>
                <div className="text-xs text-gray-500">Engagement</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-gray-900">{formatNumber(influencer.average_likes)}</div>
                <div className="text-xs text-gray-500">Avg Likes</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-gray-900">{formatNumber(influencer.average_views as number | string | undefined)}</div>
                <div className="text-xs text-gray-500">Avg Views</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'posts'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Recent Posts
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-4 max-h-80 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Additional Profile Info */}
                <div className="space-y-2">
                  {influencer.content_count && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Total Posts</span>
                      <span className="text-sm font-medium text-gray-900">{formatNumber(influencer.content_count)}</span>
                    </div>
                  )}
                  {influencer.age_group && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Age Group</span>
                      <span className="text-sm font-medium text-gray-900">{influencer.age_group}</span>
                    </div>
                  )}
                  {influencer.platform_account_type && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Account Type</span>
                      <span className="text-sm font-medium text-gray-900">{influencer.platform_account_type}</span>
                    </div>
                  )}
                  {/* Show platform account ID for debugging */}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Platform ID</span>
                    <span className="text-xs font-mono text-gray-600">{influencer.external_id || influencer.id || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div>
                {loadingPosts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {posts.map((post) => (
                      <div key={post.id} className="relative aspect-square">
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {post.type === 'video' && (
                          <div className="absolute top-1 right-1">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        )}
                        {post.type === 'carousel' && (
                          <div className="absolute top-1 right-1">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 rounded-b-lg">
                          <div className="flex items-center space-x-1 text-white text-xs">
                            <div className="flex items-center space-x-1">
                              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              <span>{formatNumber(post.likes)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">No posts available</p>
                    <p className="text-xs">Posts will be loaded when available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInsightsModal;