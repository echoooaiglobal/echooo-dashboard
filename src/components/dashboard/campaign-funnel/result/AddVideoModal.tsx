// src/components/dashboard/campaign-funnel/result/AddVideoModal.tsx
'use client';

import { useState } from 'react';
import { 
  getInstagramPostDetails, 
  validateInstagramUrl, 
  mapToBackendFormat 
} from '@/services/ensembledata/user-detailed-info/instagram.service';
import { createVideoResult } from '@/services/video-results';
import { ProcessedInstagramData } from '@/types/user-detailed-info';

interface VideoData {
  url: string;
  title: string;
  description: string;
  influencer: string;
}

interface AddVideoModalProps {
  campaignId: string;
  onClose: () => void;
  onSubmit: (videoData: VideoData) => void;
}

const AddVideoModal: React.FC<AddVideoModalProps> = ({ campaignId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<VideoData>({
    url: '',
    title: '',
    description: '',
    influencer: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<VideoData>>({});
  const [instagramData, setInstagramData] = useState<ProcessedInstagramData | null>(null);
  const [step, setStep] = useState<'input' | 'preview' | 'saving'>('input');

  // Image proxy utility function - using the same approach as before
  const getProxiedImageUrl = (originalUrl: string): string => {
    if (!originalUrl) return '/user/profile-placeholder.png';
    
    // If already proxied or is a local image, return as is
    if (originalUrl.startsWith('/api/') || originalUrl.startsWith('/user/') || originalUrl.startsWith('data:')) {
      return originalUrl;
    }
    
    // If it's an Instagram/Facebook CDN URL, proxy it
    if (originalUrl.includes('instagram.com') || originalUrl.includes('fbcdn.net') || originalUrl.includes('cdninstagram.com')) {
      return `/api/v0/instagram/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    }
    
    return originalUrl;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VideoData> = {};

    if (!formData.url.trim()) {
      newErrors.url = 'Video URL is required';
    } else if (!isValidUrl(formData.url) && !isValidInstagramCode(formData.url)) {
      newErrors.url = 'Please enter a valid Instagram URL or post code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return validateInstagramUrl(string);
    } catch (_) {
      return false;
    }
  };

  const isValidInstagramCode = (string: string): boolean => {
    // Check if it's a valid Instagram post code format
    return /^[a-zA-Z0-9_-]+$/.test(string) && string.length > 5;
  };

  const handleInputChange = (field: keyof VideoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const fetchInstagramData = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setStep('preview');
    
    try {
      console.log('🔍 AddVideoModal: Fetching Instagram post data...');
      
      let input: { url?: string; code?: string };
      
      if (isValidUrl(formData.url)) {
        input = { url: formData.url };
      } else {
        input = { code: formData.url };
      }

      console.log('🚀 AddVideoModal: Calling Instagram service...');
      const response = await getInstagramPostDetails(input);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch Instagram post data');
      }

      setInstagramData(response);
      
      // Auto-fill form data with Instagram response
      setFormData(prev => ({
        ...prev,
        title: response.post.caption || response.post.title || 'Instagram Post',
        influencer: response.user.username || response.user.full_name || '',
        description: response.post.caption || ''
      }));

      console.log('✅ AddVideoModal: Instagram data fetched successfully');
    } catch (error) {
      console.error('💥 AddVideoModal: Error fetching Instagram data:', error);
      setErrors({ url: error instanceof Error ? error.message : 'Failed to fetch post data' });
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'input') {
      await fetchInstagramData();
      return;
    }

    if (!instagramData || !instagramData.success) {
      setErrors({ url: 'Please fetch Instagram data first' });
      return;
    }

    setIsLoading(true);
    setStep('saving');
    
    try {
      console.log('💾 AddVideoModal: Saving video result to backend...');
      
      // Map Instagram data to backend format
      const backendData = mapToBackendFormat(instagramData, campaignId);
      
      const videoResult = await createVideoResult(backendData);

      console.log('✅ AddVideoModal: Video result saved successfully:', videoResult);
      
      // Call the parent's onSubmit with the form data
      onSubmit(formData);
      
      // Close modal after successful save
      onClose();
    } catch (error) {
      console.error('💥 AddVideoModal: Error saving video result:', error);
      setErrors({ url: error instanceof Error ? error.message : 'Failed to save video data' });
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('input');
    setInstagramData(null);
    setErrors({});
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderPreview = () => {
    if (!instagramData) return null;

    return (
      <div className="space-y-6">
        {/* Instagram Post Preview Card */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                </svg>
              </div>
              Instagram Post Data
            </h4>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
              Fetched Successfully
            </span>
          </div>
          
          {/* User and Post Info */}
          <div className="grid grid-cols-1 gap-6">
            {/* User Profile Section */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                User Profile
              </h5>
              
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={getProxiedImageUrl(instagramData.user.profile_pic_url)}
                  alt={instagramData.user.username}
                  className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{instagramData.user.full_name}</p>
                    {instagramData.user.is_verified && (
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">@{instagramData.user.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">Followers</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(instagramData.user.followers_count || 0)}</p>
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">Posts</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(instagramData.user.posts_count || 0)}</p>
                </div>
              </div>
            </div>

            {/* Post Content Section */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Post Content
              </h5>
              
              {instagramData.post.thumbnail_src && (
                <div className="mb-4">
                  <img
                    src={getProxiedImageUrl(instagramData.post.thumbnail_src)}
                    alt="Post thumbnail"
                    className="w-full h-40 object-cover rounded-lg shadow-sm border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                    }}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <p className="text-xs font-medium text-gray-600">Likes</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatNumber(instagramData.post.likes_count)}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-xs font-medium text-gray-600">Comments</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatNumber(instagramData.post.comments_count)}</p>
                </div>
                {instagramData.post.view_counts ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-600">Views</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatNumber(instagramData.post.view_counts)}</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <svg className="w-4 h-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-600">Type</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{instagramData.post.is_video ? 'Video' : 'Photo'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Caption Preview */}
          {instagramData.post.caption && (
            <div className="mt-6 bg-white rounded-xl p-4 border border-gray-100">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Post Caption
              </h5>
              <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
                {instagramData.post.caption}
              </p>
            </div>
          )}
        </div>

        {/* Editable Form Fields */}
        <div className="space-y-4">
          {/* Video Title */}
          <div>
            <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              id="videoTitle"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter video title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
            />
          </div>

          {/* Influencer Name */}
          <div>
            <label htmlFor="influencer" className="block text-sm font-medium text-gray-700 mb-2">
              Influencer Name *
            </label>
            <input
              type="text"
              id="influencer"
              value={formData.influencer}
              onChange={(e) => handleInputChange('influencer', e.target.value)}
              placeholder="Enter influencer name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter video description or notes"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 resize-none"
            />
          </div>
        </div>
      </div>
    );
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {step === 'input' ? 'Add New Video' : step === 'preview' ? 'Review & Save' : 'Saving...'}
              </h3>
              <p className="text-sm text-gray-600">
                {step === 'input' ? 'Enter Instagram post URL or code' : step === 'preview' ? 'Review the fetched data and save' : 'Processing your request...'}
              </p>
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
            {step === 'input' && (
              <div className="space-y-6">
                {/* Video URL Input */}
                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Post URL or Code *
                  </label>
                  <input
                    type="text"
                    id="videoUrl"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://instagram.com/p/CjDN1tzMIjR or CjDN1tzMIjR"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.url 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                  />
                  {errors.url && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {/* {errors.url} */}
                      {errors.url === 'Maximum requests limit reached for today. Send an email at hello@ensembledata.com' ? (
                        'Maximum requests limit reached for today, please try again tomorrow.'
                      ) : (
                        errors.url
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 'preview' && renderPreview()}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-6 mt-6 border-t border-gray-200">
              {step === 'preview' && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              )}
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {step === 'input' ? 'Fetching...' : step === 'preview' ? 'Fetching...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    {step === 'input' ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Fetch Data
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Video
                      </>
                    )}
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

export default AddVideoModal;