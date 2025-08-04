// src/components/dashboard/campaign-funnel/result/EditVideoModal.tsx
'use client';

import React, { useState } from 'react';
import { VideoResult } from '@/types/user-detailed-info';

interface EditVideoModalProps {
  video: VideoResult;
  onClose: () => void;
  onSubmit: (videoData: any) => void;
}

const EditVideoModal: React.FC<EditVideoModalProps> = ({ video, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Extract current data from the video object
  const postData = video.post_result_obj?.data;
  const currentCollaborationPrice = video.collaboration_price || postData?.collaboration_price || 0;
  
  // Enhanced shares extraction to handle different data structures
  const getCurrentShares = () => {
    // First check the video object itself
    if (video.shares_count !== undefined && video.shares_count !== null) {
      return video.shares_count;
    }
    
    // Then check post_result_obj.data
    if (postData) {
      if (postData.shares_count !== undefined && postData.shares_count !== null) {
        return postData.shares_count;
      }
      
      if (postData.edge_media_to_share?.count !== undefined && postData.edge_media_to_share?.count !== null) {
        return postData.edge_media_to_share.count;
      }
    }
    
    // Default to 0 if not found
    return 0;
  };
  
  const currentShares = getCurrentShares();
  
  // Fix views calculation to match the PublishedResults table logic
  const getCorrectViews = () => {
    if (!postData) {
      const viewsFromAPI = Math.max(0, video.views_count || 0);
      const playsFromAPI = Math.max(0, video.plays_count || 0);
      return Math.max(viewsFromAPI, playsFromAPI);
    }

    const videoPlaysFromAPI = Math.max(0, postData.video_view_count || postData.video_play_count || 0);
    const generalViewsFromAPI = Math.max(0, video.views_count || 0);
    const playsFromVideo = Math.max(0, video.plays_count || 0);
    
    return Math.max(videoPlaysFromAPI, generalViewsFromAPI, playsFromVideo);
  };
  
  const [formData, setFormData] = useState({
    profileUrl: `https://instagram.com/p/${postData?.shortcode || video.post_id}`,
    influencerUsername: video.influencer_username,
    fullName: video.full_name,
    title: video.title,
    likes: video.likes_count || postData?.edge_media_preview_like?.count || 0,
    comments: video.comments_count || postData?.edge_media_to_comment?.count || 0,
    shares: currentShares, // Added shares field
    views: getCorrectViews(),
    followers: video.followers_count || postData?.owner?.edge_followed_by?.count || 0,
    engagementRate: '0%',
    collaborationPrice: currentCollaborationPrice
  });

  // Add debug logging when component mounts
  React.useEffect(() => {
    console.log('🔍 EditVideoModal: Initial video data:', video);
    console.log('📊 EditVideoModal: Current shares value:', currentShares);
    console.log('📊 EditVideoModal: Form data initialized with shares:', formData.shares);
  }, []);

  // Add debug logging when shares value changes
  React.useEffect(() => {
    console.log('📤 EditVideoModal: Shares value changed to:', formData.shares);
  }, [formData.shares]);

  // Calculate engagement rate - Updated to include shares
  React.useEffect(() => {
    if (formData.followers > 0) {
      const rate = (((formData.likes + formData.comments + formData.shares) / formData.followers) * 100).toFixed(2);
      setFormData(prev => ({ ...prev, engagementRate: `${rate}%` }));
    }
  }, [formData.likes, formData.comments, formData.shares, formData.followers]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.likes < 0) {
      newErrors.likes = 'Likes cannot be negative';
    }
    if (formData.comments < 0) {
      newErrors.comments = 'Comments cannot be negative';
    }
    if (formData.shares < 0) {
      newErrors.shares = 'Shares cannot be negative';
    }
    if (formData.views < 0) {
      newErrors.views = 'Views cannot be negative';
    }
    if (formData.followers < 0) {
      newErrors.followers = 'Followers cannot be negative';
    }
    if (formData.collaborationPrice < 0) {
      newErrors.collaborationPrice = 'Collaboration price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare the update data with shares information
      const updateData = {
        ...formData,
        // Ensure shares data is properly structured for backend
        shares_count: formData.shares,
        // Update the post_result_obj to include the new shares data
        post_result_obj: {
          ...video.post_result_obj,
          data: {
            ...video.post_result_obj?.data,
            shares_count: formData.shares,
            edge_media_to_share: { count: formData.shares },
            // Update other metrics as well
            edge_media_preview_like: { count: formData.likes },
            edge_media_to_comment: { count: formData.comments },
            collaboration_price: formData.collaborationPrice,
            owner: {
              ...video.post_result_obj?.data?.owner,
              edge_followed_by: { count: formData.followers }
            }
          }
        }
      };

      console.log('🔄 EditVideoModal: Updating video with data:', updateData);
      console.log('📤 EditVideoModal: Updated shares value:', formData.shares);
      
      await onSubmit(updateData);
    } catch (error) {
      console.error('💥 EditVideoModal: Error updating video:', error);
      setErrors({ general: 'Failed to update video. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Video Details</h3>
              <p className="text-sm text-gray-600">Update the video information and metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-white/50"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Profile URL (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile/Post URL
                </label>
                <input
                  type="url"
                  value={formData.profileUrl}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* Username and Full Name (Read-only) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editUsername" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="editUsername"
                    value={formData.influencerUsername}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="editFullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="editFullName"
                    value={formData.fullName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Title (Read-only) */}
              <div>
                <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  id="editTitle"
                  value={formData.title}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* Metrics Grid - Updated with Shares field */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editLikes" className="block text-sm font-medium text-gray-700 mb-2">
                    Likes
                  </label>
                  <input
                    type="number"
                    id="editLikes"
                    min="0"
                    value={formData.likes}
                    onChange={(e) => handleInputChange('likes', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.likes 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    }`}
                  />
                  {errors.likes && (
                    <p className="mt-2 text-sm text-red-600">{errors.likes}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="editComments" className="block text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </label>
                  <input
                    type="number"
                    id="editComments"
                    min="0"
                    value={formData.comments}
                    onChange={(e) => handleInputChange('comments', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.comments 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    }`}
                  />
                  {errors.comments && (
                    <p className="mt-2 text-sm text-red-600">{errors.comments}</p>
                  )}
                </div>

                {/* New Shares field */}
                <div>
                  <label htmlFor="editShares" className="block text-sm font-medium text-gray-700 mb-2">
                    Shares
                  </label>
                  <input
                    type="number"
                    id="editShares"
                    min="0"
                    value={formData.shares}
                    onChange={(e) => handleInputChange('shares', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.shares 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    }`}
                  />
                  {errors.shares && (
                    <p className="mt-2 text-sm text-red-600">{errors.shares}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="editViews" className="block text-sm font-medium text-gray-700 mb-2">
                    Views
                  </label>
                  <input
                    type="number"
                    id="editViews"
                    min="0"
                    value={formData.views}
                    onChange={(e) => handleInputChange('views', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.views 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    }`}
                  />
                  {errors.views && (
                    <p className="mt-2 text-sm text-red-600">{errors.views}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="editFollowers" className="block text-sm font-medium text-gray-700 mb-2">
                    Followers
                  </label>
                  <input
                    type="number"
                    id="editFollowers"
                    min="0"
                    value={formData.followers}
                    onChange={(e) => handleInputChange('followers', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.followers 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    }`}
                  />
                  {errors.followers && (
                    <p className="mt-2 text-sm text-red-600">{errors.followers}</p>
                  )}
                </div>
              </div>

              {/* Engagement Rate and Collaboration Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editEngagementRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Engagement Rate
                  </label>
                  <input
                    type="text"
                    id="editEngagementRate"
                    value={formData.engagementRate}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Auto-calculated based on likes, comments, and shares</p>
                </div>

                <div>
                  <label htmlFor="editCollaborationPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Collaboration Price
                  </label>
                  <input
                    type="number"
                    id="editCollaborationPrice"
                    min="0"
                    step="0.01"
                    value={formData.collaborationPrice}
                    onChange={(e) => handleInputChange('collaborationPrice', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.collaborationPrice 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    }`}
                  />
                  {errors.collaborationPrice && (
                    <p className="mt-2 text-sm text-red-600">{errors.collaborationPrice}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Enter collaboration price in USD</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Video
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVideoModal;