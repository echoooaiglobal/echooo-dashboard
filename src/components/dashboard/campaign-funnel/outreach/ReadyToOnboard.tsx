// src/components/dashboard/campaign-funnel/outreach/ReadyToOnboard.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useOutreach } from '@/context/OutreachContext';
import { formatNumber } from '@/utils/format';

const ReadyToOnboard: React.FC = () => {
  const { readyToOnboardInfluencers, loading, error } = useOutreach();
  const [searchText, setSearchText] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDirectionDropdown, setShowDirectionDropdown] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState('Cost Per View (CPV)');
  const [selectedDirection, setSelectedDirection] = useState('Low to High');
  const [sortField, setSortField] = useState<'name' | 'followers' | 'engagements' | 'avgLikes' | 'organicRatio' | 'budget' | 'cpv' | 'engagementRate'>('cpv');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (showSortDropdown && !target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }
      
      if (showDirectionDropdown && !target.closest('.direction-dropdown-container')) {
        setShowDirectionDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSortDropdown, showDirectionDropdown]);

  // Filter and sort influencers
  const filteredInfluencers = useMemo(() => {
    let influencers = [...readyToOnboardInfluencers];

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
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
          const aIndex = Math.abs((a.id || '').charCodeAt(0)) % 9;
          const bIndex = Math.abs((b.id || '').charCodeAt(0)) % 9;
          aValue = parseFloat((['0.53', '0.34', '0.24', '0.64', '0.24', '2.53', '1.64', '0.86', '3.55'][aIndex] || '0'));
          bValue = parseFloat((['0.53', '0.34', '0.24', '0.64', '0.24', '2.53', '1.64', '0.86', '3.55'][bIndex] || '0'));
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
  }, [readyToOnboardInfluencers, searchText, sortField, sortDirection]);

  // Sort and direction options
  const sortOptions = [
    { label: 'Cost Per View (CPV)', field: 'cpv' as const },
    { label: 'By Price', field: 'budget' as const },
    { label: 'Engagement Rate', field: 'engagementRate' as const },
  ];

  const directionOptions = [
    { label: 'Low to High', value: 'asc' as const },
    { label: 'High to Low', value: 'desc' as const },
    { label: 'Average', value: 'asc' as const },
  ];

  const handleSortOptionChange = (option: typeof sortOptions[0]) => {
    setSelectedSortOption(option.label);
    setSortField(option.field);
    setShowSortDropdown(false);
    
    if (option.field === 'budget' || option.field === 'cpv') {
      setSelectedDirection('Low to High');
      setSortDirection('asc');
    }
  };

  const handleDirectionChange = (direction: typeof directionOptions[0]) => {
    setSelectedDirection(direction.label);
    setSortDirection(direction.value);
    setShowDirectionDropdown(false);
  };

  const handleSortDropdownToggle = () => {
    if (showDirectionDropdown) {
      setShowDirectionDropdown(false);
    }
    setShowSortDropdown(!showSortDropdown);
  };

  const handleDirectionDropdownToggle = () => {
    if (showSortDropdown) {
      setShowSortDropdown(false);
    }
    setShowDirectionDropdown(!showDirectionDropdown);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">Ready to Onboard</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Show error state only for persistent errors, not after successful operations
  const displayError = error && !readyToOnboardInfluencers.length;
  if (displayError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900 text-red-600">Error</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load data</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">
          Ready to Onboard ({formatNumber(filteredInfluencers.length)})
        </h3>
        
        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          {/* Sort Dropdown */}
          <div className="relative sort-dropdown-container">
            <button
              onClick={handleSortDropdownToggle}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>

            {/* Sort Dropdown Menu */}
            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Sort by</h3>
                  <button
                    onClick={() => setShowSortDropdown(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.field}
                      onClick={() => handleSortOptionChange(option)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-full border-2 transition-colors text-xs ${
                        selectedSortOption === option.label
                          ? 'border-purple-300 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {selectedSortOption === option.label && (
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direction Dropdown (only show when "By Price" is selected) */}
          {selectedSortOption === 'By Price' && (
            <div className="relative direction-dropdown-container">
              <button
                onClick={handleDirectionDropdownToggle}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>

              {/* Direction Dropdown Menu */}
              {showDirectionDropdown && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Sort by</h3>
                    <button
                      onClick={() => setShowDirectionDropdown(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {directionOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => handleDirectionChange(option)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-full border-2 transition-colors text-xs ${
                          selectedDirection === option.label
                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                        {selectedDirection === option.label && (
                          <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg 
              className="w-3.5 h-3.5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Influencers List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredInfluencers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 font-medium">No Completed Influencers</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchText ? 'Try adjusting your search' : 'No influencers have completed status yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredInfluencers.map((influencer) => (
              <div
                key={influencer.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors duration-150 border border-gray-200 rounded-md"
              >
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        influencer.social_account?.profile_pic_url || 
                        influencer.social_account?.additional_metrics?.profileImage ||
                        '/default-avatar.png'
                      }
                      alt="avatar"
                      className="rounded-full w-8 h-8 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    {/* Platform icon overlaid on profile picture */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center border border-white">
                      <svg 
                        className="w-2 h-2 text-white" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    {/* Verification badge */}
                    {influencer.social_account?.is_verified && (
                      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {influencer.social_account?.full_name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      @{influencer.social_account?.account_handle || 'unknown'}
                    </p>
                  </div>
                </div>
                
                {/* Right side - Followers and Price */}
                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                  {/* Followers Count */}
                  <span className="text-[9px] text-gray-400">
                    {formatNumber(influencer.social_account?.followers_count || 0)} followers
                  </span>
                  
                  {/* Collaboration Price */}
                  {influencer.collaboration_price ? (
                    <span className="text-[9px] text-green-600 font-medium">
                      ${formatNumber(influencer.collaboration_price)} {influencer.currency || 'USD'}
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-400">
                      Price TBD
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadyToOnboard;