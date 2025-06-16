// src/components/dashboard/campaign-funnel/result/AddVideoModal.tsx
'use client';

import { useState } from 'react';
import { getInstagramPostDetails, validateInstagramUrl, extractInstagramPostCode, mapToBackendFormat } from '@/services/ensembledata/user-detailed-info';
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
      console.log('🔍 Fetching Instagram post data...');
      
      let input: { url?: string; code?: string };
      
      if (isValidUrl(formData.url)) {
        input = { url: formData.url };
      } else {
        input = { code: formData.url };
      }

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

      console.log('✅ Instagram data fetched successfully');
    } catch (error) {
      console.error('💥 Error fetching Instagram data:', error);
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
      console.log('💾 Saving video result to backend...');
      
      // Map Instagram data to backend format
      const backendData = mapToBackendFormat(instagramData, campaignId);
      
      const videoResult = await createVideoResult(backendData);

      console.log('✅ Video result saved successfully:', videoResult);
      
      // Call the parent's onSubmit with the form data
      onSubmit(formData);
      
      // Close modal after successful save
      onClose();
    } catch (error) {
      console.error('💥 Error saving video result:', error);
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

  const renderPreview = () => {
    if (!instagramData) return null;

    return (
      <div className="space-y-4">
        {/* Instagram Post Preview */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram Post Data
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* User Info */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                {instagramData.user.profile_pic_url && (
                  <img
                    src={instagramData.user.profile_pic_url}
                    alt={instagramData.user.username}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{instagramData.user.full_name}</p>
                  <p className="text-sm text-gray-500">@{instagramData.user.username}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers:</span>
                  <span className="font-medium">{instagramData.user.followers_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts:</span>
                  <span className="font-medium">{instagramData.user.posts_count?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Post Info */}
            <div>
              {instagramData.post.thumbnail_src && (
                <img
                  src={instagramData.post.thumbnail_src}
                  alt="Post thumbnail"
                  className="w-full h-24 object-cover rounded-lg mb-3"
                />
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes:</span>
                  <span className="font-medium">{instagramData.post.likes_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments:</span>
                  <span className="font-medium">{instagramData.post.comments_count.toLocaleString()}</span>
                </div>
                {instagramData.post.view_counts && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium">{instagramData.post.view_counts.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {step === 'input' ? 'Add New Video' : step === 'preview' ? 'Review & Save' : 'Saving...'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {step === 'input' && (
              <div className="space-y-4">
                {/* Video URL */}
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
                    <p className="mt-1 text-sm text-red-600">{errors.url}</p>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium disabled:opacity-50"
                >
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
                    {step === 'input' ? 'Fetching...' : step === 'preview' ? 'Saving...' : 'Processing...'}
                  </>
                ) : (
                  step === 'input' ? 'Fetch Data' : 'Save Video'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Note */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">How to use:</p>
                <p>1. Enter Instagram post URL or post code</p>
                <p>2. We'll fetch the post data automatically</p>
                <p>3. Review and edit the details</p>
                <p>4. Save to add to your campaign</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVideoModal;