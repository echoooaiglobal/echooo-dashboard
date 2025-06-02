// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoverFilters.tsx
import React, { useState, useRef, useEffect } from 'react';
import { BsInstagram } from 'react-icons/bs';
import { IoChevronDown } from 'react-icons/io5';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';

// Import filter section components
import DemographicsFilters from './filters/Demographics';
import PerformanceFilters from './filters/Performance';
import ContentFilters from './filters/Content';
import AccountFilters from './filters/Account';

type DiscoverFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  onApplyFilters: (appliedFilters: Partial<InfluencerSearchFilter>) => void;
  onClear: () => void;
  // Platform props
  platforms?: Platform[];
  selectedPlatform?: Platform | null;
  onPlatformChange?: (platform: Platform) => void;
  isLoadingPlatforms?: boolean;
};

export default function DiscoverFilters({
  searchParams,
  onFilterChange,
  onApplyFilters,
  onClear,
  platforms = [],
  selectedPlatform = null,
  onPlatformChange,
  isLoadingPlatforms = false,
}: DiscoverFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  
  // State to track pending filter changes before applying
  const [pendingFilters, setPendingFilters] = useState<Partial<InfluencerSearchFilter>>({});
  
  // State to track which filter dropdown is open
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Platform dropdown states
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [platformSearchQuery, setPlatformSearchQuery] = useState<string>('');

  // Define popular platforms that should appear first
  const POPULAR_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setOpenFilterId(null);
        setIsPlatformDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle filter changes by updating pending filters
  const handlePendingFilterChange = (updates: Partial<InfluencerSearchFilter>) => {
    setPendingFilters(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Handle platform selection
  const handlePlatformSelect = (platform: Platform) => {
    if (onPlatformChange) {
      onPlatformChange(platform);
      // Also update the search params for the current filter session
      handlePendingFilterChange({ work_platform_id: platform.work_platform_id });
    }
    setIsPlatformDropdownOpen(false);
    setPlatformSearchQuery(''); // Reset search when selecting
  };

  // Function to get popular platforms
  const getPopularPlatforms = () => {
    return platforms.filter(platform => 
      platform.status === 'ACTIVE' && 
      POPULAR_PLATFORMS.some(popular => 
        platform.name.toLowerCase().includes(popular)
      )
    ).sort((a, b) => {
      // Sort by popularity order
      const aIndex = POPULAR_PLATFORMS.findIndex(popular => 
        a.name.toLowerCase().includes(popular)
      );
      const bIndex = POPULAR_PLATFORMS.findIndex(popular => 
        b.name.toLowerCase().includes(popular)
      );
      return aIndex - bIndex;
    });
  };

  // Function to get filtered platforms based on search
  const getFilteredPlatforms = () => {
    if (!platformSearchQuery.trim()) {
      return getPopularPlatforms();
    }
    
    return platforms.filter(platform => 
      platform.status === 'ACTIVE' && 
      (platform.name.toLowerCase().includes(platformSearchQuery.toLowerCase()) ||
       platform.description?.toLowerCase().includes(platformSearchQuery.toLowerCase()))
    );
  };

  // Function to get other platforms (non-popular ones)
  const getOtherPlatforms = () => {
    const popularPlatforms = getPopularPlatforms();
    const popularIds = popularPlatforms.map(p => p.id);
    
    return platforms.filter(platform => 
      platform.status === 'ACTIVE' && 
      !popularIds.includes(platform.id)
    );
  };

  // Apply all pending filters when button is clicked
  const applyFilters = async () => {
    if (Object.keys(pendingFilters).length > 0) {
      setIsApplying(true);
      try {
        await onApplyFilters(pendingFilters);
        setPendingFilters({});
        setOpenFilterId(null); // Close any open dropdowns
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setIsApplying(false);
      }
    }
  };

  // Clear all filters
  const clearAllFilters = async () => {
    setIsClearing(true);
    try {
      // Clear pending filters but don't modify existing searchParams automatically
      setPendingFilters({});
      setOpenFilterId(null);
      
      // Only call onClear to reset the actual applied filters
      await onClear();
    } catch (error) {
      console.error('Error clearing filters:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = (filterId: string) => {
    setOpenFilterId(prev => prev === filterId ? null : filterId);
  };

  // Check if a filter dropdown is open
  const isFilterOpen = (filterId: string) => {
    return openFilterId === filterId;
  };

  // Combine current searchParams with pending changes for display
  const getDisplayFilters = (): InfluencerSearchFilter => {
    return {
      ...searchParams,
      ...pendingFilters
    };
  };

  const displayFilters = getDisplayFilters();

  // Common style for filter buttons
  const filterButtonStyle = "flex justify-between items-center w-full bg-white text-gray-700 px-4 py-3 rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none";

  // Check if there are any pending changes
  const hasPendingChanges = Object.keys(pendingFilters).length > 0;

  // Get platform icon based on platform name
  const getPlatformIcon = (platform: Platform) => {
    if (platform.logo_url) {
      return (
        <img 
          src={platform.logo_url} 
          alt={platform.name}
          className="w-5 h-5 object-contain"
          onError={(e) => {
            // Fallback to default icon if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    
    // Fallback icons based on platform name
    switch (platform.name.toLowerCase()) {
      case 'instagram':
        return <BsInstagram className="text-pink-500" size={20} />;
      case 'tiktok':
        return <div className="w-5 h-5 bg-black rounded-sm" />; // Simple TikTok icon
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded-sm" />; // Generic icon
    }
  };

  return (
    <div
      className="p-6 bg-white rounded-lg shadow-lg"
      ref={filtersRef}
    >
      <div className="mb-6">
        {/* Header with Platform selector */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-700">
            Narrow your discovered influencers
          </h2>
          
          {/* Platform selector dropdown */}
          <div className="relative">
            {isLoadingPlatforms ? (
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition-colors"
                >
                  {selectedPlatform ? (
                    <>
                      {getPlatformIcon(selectedPlatform)}
                      <span>{selectedPlatform.name}</span>
                    </>
                  ) : (
                    <>
                      <BsInstagram className="text-pink-500" size={20} />
                      <span>Select Platform</span>
                    </>
                  )}
                  <IoChevronDown 
                    className={`text-gray-500 transition-transform ${
                      isPlatformDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Platform dropdown menu */}
                {isPlatformDropdownOpen && platforms.length > 0 && (
                  <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                    {/* Search box */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search platforms..."
                          value={platformSearchQuery}
                          onChange={(e) => setPlatformSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <svg 
                          className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Platforms list */}
                    <div className="py-1 max-h-80 overflow-y-auto">
                      {(() => {
                        const filteredPlatforms = getFilteredPlatforms();
                        const otherPlatforms = !platformSearchQuery.trim() ? getOtherPlatforms() : [];
                        
                        if (filteredPlatforms.length === 0 && otherPlatforms.length === 0) {
                          return (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                              No platforms found matching "{platformSearchQuery}"
                            </div>
                          );
                        }

                        return (
                          <>
                            {/* Popular/Filtered platforms */}
                            {filteredPlatforms.length > 0 && (
                              <>
                                {!platformSearchQuery.trim() && (
                                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                                    Popular Platforms
                                  </div>
                                )}
                                {filteredPlatforms.map((platform) => (
                                  <button
                                    key={platform.id}
                                    onClick={() => handlePlatformSelect(platform)}
                                    className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                      selectedPlatform?.id === platform.id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                    }`}
                                  >
                                    {getPlatformIcon(platform)}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{platform.name}</div>
                                      {platform.description && (
                                        <div className="text-xs text-gray-500 truncate">{platform.description}</div>
                                      )}
                                    </div>
                                    {selectedPlatform?.id === platform.id && (
                                      <div className="flex-shrink-0">
                                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </>
                            )}
                            
                            {/* Other platforms (only shown when not searching) */}
                            {!platformSearchQuery.trim() && otherPlatforms.length > 0 && (
                              <>
                                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 border-t border-gray-100">
                                  Other Platforms
                                </div>
                                {otherPlatforms.slice(0, 5).map((platform) => ( // Limit to 5 for initial display
                                  <button
                                    key={platform.id}
                                    onClick={() => handlePlatformSelect(platform)}
                                    className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                      selectedPlatform?.id === platform.id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                    }`}
                                  >
                                    {getPlatformIcon(platform)}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{platform.name}</div>
                                      {platform.description && (
                                        <div className="text-xs text-gray-500 truncate">{platform.description}</div>
                                      )}
                                    </div>
                                    {selectedPlatform?.id === platform.id && (
                                      <div className="flex-shrink-0">
                                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </button>
                                ))}
                                {otherPlatforms.length > 5 && (
                                  <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                                    +{otherPlatforms.length - 5} more platforms (use search to find them)
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Demographics Filters */}
        <DemographicsFilters 
          searchParams={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Performance Filters */}
        <PerformanceFilters 
          searchParams={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Content Filters */}
        <ContentFilters 
          searchParams={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Account Filters */}
        <AccountFilters 
          searchParams={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            onClick={clearAllFilters}
            disabled={isClearing || isApplying}
            className={`border border-gray-300 px-8 py-2 rounded-full shadow-sm transition-colors flex items-center gap-2 ${
              isClearing || isApplying
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {isClearing && (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            Clear
          </button>
          <button 
            onClick={applyFilters}
            disabled={!hasPendingChanges || isApplying || isClearing}
            className={`px-8 py-2 rounded-full shadow-md transition-colors flex items-center gap-2 ${
              hasPendingChanges && !isApplying && !isClearing
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isApplying && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Apply Filters {hasPendingChanges && !isApplying && `(${Object.keys(pendingFilters).length})`}
          </button>
        </div>
      </div>
    </div>
  );
}