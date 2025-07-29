// src/components/dashboard/campaign-funnel/outreach/SelectedManually.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useOutreach } from '@/context/OutreachContext';
import { Campaign } from '@/types/campaign';
import { formatNumber } from '@/utils/format';

interface SelectedManuallyProps {
  onBack: () => void;
  onAllOnboarded: () => void;
  campaignData?: Campaign | null;
}

type SortField = 'name' | 'followers' | 'engagements' | 'avgLikes' | 'organicRatio' | 'budget' | 'cpv' | 'engagementRate';
type SortDirection = 'asc' | 'desc';

const SelectedManually: React.FC<SelectedManuallyProps> = ({ onBack, onAllOnboarded }) => {
  const { readyToOnboardInfluencers, onboardSelected, loading, error } = useOutreach();
  
  // Local state
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Filter and sort influencers
  const filteredInfluencers = useMemo(() => {
    let influencers = [...readyToOnboardInfluencers];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      influencers = influencers.filter(influencer => {
        const fullName = (influencer.social_account?.full_name || '').toLowerCase();
        const accountHandle = (influencer.social_account?.account_handle || '').toLowerCase();
        
        return fullName.includes(searchLower) || accountHandle.includes(searchLower);
      });
    }

    // Apply sorting
    influencers.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortField) {
        case 'name':
          aValue = a.social_account?.full_name || '';
          bValue = b.social_account?.full_name || '';
          break;
        case 'followers':
          aValue = a.social_account?.followers_count || 0;
          bValue = b.social_account?.followers_count || 0;
          break;
        case 'engagements':
          aValue = a.social_account?.additional_metrics?.average_likes || 0;
          bValue = b.social_account?.additional_metrics?.average_likes || 0;
          break;
        case 'avgLikes':
          aValue = a.social_account?.additional_metrics?.average_likes || 0;
          bValue = b.social_account?.additional_metrics?.average_likes || 0;
          break;
        case 'organicRatio':
          aValue = a.social_account?.additional_metrics?.engagementRate || 0;
          bValue = b.social_account?.additional_metrics?.engagementRate || 0;
          break;
        case 'budget':
          aValue = a.collaboration_price || 0;
          bValue = b.collaboration_price || 0;
          break;
        case 'cpv':
          aValue = parseFloat((['0.53', '0.34', '0.24', '0.64', '0.24', '2.53', '1.64', '0.86', '3.55'][Math.abs(a.id.charCodeAt(0)) % 9] || '0').replace('$', ''));
          bValue = parseFloat((['0.53', '0.34', '0.24', '0.64', '0.24', '2.53', '1.64', '0.86', '3.55'][Math.abs(b.id.charCodeAt(0)) % 9] || '0').replace('$', ''));
          break;
        case 'engagementRate':
          aValue = a.social_account?.additional_metrics?.engagementRate || 0;
          bValue = b.social_account?.additional_metrics?.engagementRate || 0;
          break;
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return influencers;
  }, [readyToOnboardInfluencers, searchTerm, sortField, sortDirection]);

  const toggleInfluencerSelection = (influencerId: string) => {
    const newSelection = new Set(selectedInfluencers);
    if (newSelection.has(influencerId)) {
      newSelection.delete(influencerId);
    } else {
      newSelection.add(influencerId);
    }
    setSelectedInfluencers(newSelection);
  };

  const selectAll = () => {
    if (selectedInfluencers.size === filteredInfluencers.length) {
      setSelectedInfluencers(new Set());
    } else {
      setSelectedInfluencers(new Set(filteredInfluencers.map(inf => inf.id)));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOnboardSelected = async () => {
    if (selectedInfluencers.size === 0) {
      return;
    }

    setIsOnboarding(true);
    setLocalError(null); // Clear any local errors

    try {
      const influencerIds = Array.from(selectedInfluencers);
      const wasSelectingAll = selectedInfluencers.size === filteredInfluencers.length && filteredInfluencers.length === readyToOnboardInfluencers.length;

      console.log('🔄 SelectedManually: Onboarding selected influencers:', influencerIds);

      await onboardSelected(influencerIds);

      console.log('✅ SelectedManually: Successfully onboarded influencers');
      
      // Clear selections
      setSelectedInfluencers(new Set());
      
      // If all influencers were selected and onboarded, close the component
      if (wasSelectingAll) {
        console.log('🎯 SelectedManually: All influencers onboarded, closing component');
        onAllOnboarded();
        return; // Exit early to prevent showing error state
      }
      
    } catch (err) {
      console.error('❌ SelectedManually: Error onboarding influencers:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to onboard influencers');
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleCloseTab = () => {
    onBack();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading influencers...</span>
        </div>
      </div>
    );
  }

  // Only show error if there's a local error OR if there's a global error AND no influencers available
  const displayError = localError || (error && readyToOnboardInfluencers.length === 0);
  if (displayError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load influencers</p>
          <p className="text-gray-500 text-sm mt-1">{displayError}</p>
          <div className="flex justify-center space-x-3 mt-4">
            <button 
              onClick={() => setLocalError(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50">
      {/* Header Section */}
      <div className="bg-white px-0 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Onboard Influencers Manually</h1>
        </div>

        {/* Search and Controls Row */}
        <div className="flex items-center space-x-3">
          {/* Search Bar - takes remaining space */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search Influencer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-4 pr-10 text-sm bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right side buttons */}
          <button 
            onClick={handleOnboardSelected}
            disabled={selectedInfluencers.size === 0 || isOnboarding}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
              selectedInfluencers.size > 0 && !isOnboarding
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isOnboarding ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Onboarding...
              </div>
            ) : (
              `Onboard Selected ${selectedInfluencers.size > 0 ? `(${selectedInfluencers.size})` : ''}`
            )}
          </button>
          <button 
            onClick={handleCloseTab}
            className="px-6 py-3 text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition-colors text-sm font-medium"
          >
            Close Tab
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white mx-0 mb-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="px-6 py-4 grid grid-cols-11 gap-4 items-center text-sm font-medium text-gray-600">
            <div className="col-span-3 flex items-center">
              <input
                type="checkbox"
                checked={selectedInfluencers.size === filteredInfluencers.length && filteredInfluencers.length > 0}
                onChange={selectAll}
                className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-1 mr-3"
              />
              <button 
                onClick={() => handleSort('name')}
                className="flex items-center hover:text-gray-800 transition-colors"
              >
                <span className="whitespace-nowrap">Name ({filteredInfluencers.length})</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${sortField === 'name' && sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
                </svg>
              </button>
            </div>
            <div className="col-span-1 flex items-center">
              <button 
                onClick={() => handleSort('followers')}
                className="flex items-center hover:text-gray-800 transition-colors"
              >
                <span className="whitespace-nowrap">Followers</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${sortField === 'followers' && sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
                </svg>
              </button>
            </div>
            <div className="col-span-1 flex items-center">
              <button 
                onClick={() => handleSort('engagements')}
                className="flex items-center hover:text-gray-800 transition-colors"
              >
                <span className="whitespace-nowrap">Engagements</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${sortField === 'engagements' && sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
                </svg>
              </button>
            </div>
            <div className="col-span-1 flex items-center">
              <button 
                onClick={() => handleSort('avgLikes')}
                className="flex items-center hover:text-gray-800 transition-colors"
              >
                <span className="whitespace-nowrap">Avg Likes</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${sortField === 'avgLikes' && sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
                </svg>
              </button>
            </div>
            <div className="col-span-1 flex items-center">
              <button 
                onClick={() => handleSort('organicRatio')}
                className="flex items-center hover:text-gray-800 transition-colors"
              >
                <span className="whitespace-nowrap">Organic Ratio</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${sortField === 'organicRatio' && sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
                </svg>
              </button>
            </div>
            <div className="col-span-1 flex items-center">
              <button 
                onClick={() => handleSort('budget')}
                className="flex items-center hover:text-gray-800 transition-colors"
              >
                <span className="whitespace-nowrap">Budget</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${sortField === 'budget' && sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
                </svg>
              </button>
            </div>
            <div className="col-span-1 flex items-center">
              <button 
                onClick={() => handleSort('cpv')}
                className="flex items-center hover:text-gray-800 transition-colors"
              >
                <span className="whitespace-nowrap">CPV</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${sortField === 'cpv' && sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
                </svg>
              </button>
            </div>
            <div className="col-span-1 flex items-center">
              <button 
                onClick={() => handleSort('engagementRate')}
                className="flex items-center hover:text-gray-800 transition-colors"
              >
                <span className="whitespace-nowrap">Engagement Rate</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${sortField === 'engagementRate' && sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4" />
                </svg>
              </button>
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="bg-white divide-y divide-gray-100">
          {filteredInfluencers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No Completed Influencers Found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search' : 'No influencers are ready for onboarding yet'}
              </p>
            </div>
          ) : (
            filteredInfluencers.map((influencer, index) => (
              <div
                key={influencer.id}
                className="px-6 py-4 grid grid-cols-11 gap-4 items-center hover:bg-gray-50 transition-colors"
              >
                {/* Influencer Info with Platform Icon */}
                <div className="col-span-3 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedInfluencers.has(influencer.id)}
                    onChange={() => toggleInfluencerSelection(influencer.id)}
                    className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-1 mr-3"
                  />
                  <div className="relative mr-3">
                    <img
                      src={
                        influencer.social_account?.profile_pic_url || 
                        influencer.social_account?.additional_metrics?.profileImage ||
                        '/default-avatar.png'
                      }
                      alt={influencer.social_account?.full_name || 'Influencer'}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    {/* Platform icon overlaid on profile picture */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded flex items-center justify-center border-2 border-white">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {influencer.social_account?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{influencer.social_account?.account_handle || 'unknown'}
                    </p>
                  </div>
                </div>

                {/* Followers */}
                <div className="col-span-1 text-sm text-gray-700">
                  {(influencer.social_account?.followers_count || 0) > 1000000 
                    ? `${((influencer.social_account?.followers_count || 0) / 1000000).toFixed(1)}M`
                    : (influencer.social_account?.followers_count || 0) > 1000
                    ? `${((influencer.social_account?.followers_count || 0) / 1000).toFixed(1)}K`
                    : formatNumber(influencer.social_account?.followers_count || 0)
                  }
                </div>

                {/* Engagements */}
                <div className="col-span-1 text-sm text-gray-700">
                  {(influencer.social_account?.additional_metrics?.average_likes || 0) > 1000
                    ? `${((influencer.social_account?.additional_metrics?.average_likes || 0) / 1000).toFixed(1)}K`
                    : formatNumber(influencer.social_account?.additional_metrics?.average_likes || 0)
                  }
                </div>

                {/* Avg Likes */}
                <div className="col-span-1 text-sm text-gray-700">
                  {(influencer.social_account?.additional_metrics?.average_likes || 0) > 1000
                    ? `${((influencer.social_account?.additional_metrics?.average_likes || 0) / 1000).toFixed(1)}K`
                    : formatNumber(influencer.social_account?.additional_metrics?.average_likes || 0)
                  }
                </div>

                {/* Organic Ratio */}
                <div className="col-span-1 text-sm text-gray-700">
                  {influencer.social_account?.additional_metrics?.engagementRate 
                    ? `${Math.round(influencer.social_account.additional_metrics.engagementRate * 1000)}%`
                    : `${34 + (index * 17) % 60}%`
                  }
                </div>

                {/* Budget */}
                <div className="col-span-1 text-sm font-medium">
                  {influencer.collaboration_price ? (
                    <span className="text-gray-700">
                      ${formatNumber(influencer.collaboration_price)}
                    </span>
                  ) : (
                    <span className="text-gray-700">
                      ${[250, 400, 120, 800, 100, 50, 530, 400, 230][index % 9]}
                    </span>
                  )}
                </div>

                {/* CPV */}
                <div className="col-span-1 text-sm text-gray-700">
                  ${['0.53', '0.34', '0.24', '0.64', '0.24', '2.53', '1.64', '0.86', '3.55'][index % 9]}%
                </div>

                {/* Engagement Rate */}
                <div className="col-span-1 text-sm text-gray-700">
                  {influencer.social_account?.additional_metrics?.engagementRate 
                    ? `${(influencer.social_account.additional_metrics.engagementRate * 100).toFixed(2)}%`
                    : '0.03%'
                  }
                </div>

                {/* Action */}
                <div className="col-span-1">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedManually;