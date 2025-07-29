// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, Check, Users, ExternalLink } from 'react-feather';
import DiscoverFilters from './DiscoverFilters';
import DiscoveredResults from './DiscoveredResults';
import { DiscoverInfluencer } from '@/lib/types';
import { Campaign } from '@/types/campaign';
import { CampaignListMember, addInfluencerToList } from '@/services/campaign/campaign-list.service';
import { DiscoveredCreatorsResults, Influencer } from '@/types/insights-iq';
import { InfluencerSearchFilter, SpecificContactDetail, AudienceInterestAffinity } from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';
import { FilterContext } from '@/utils/filter-utils';
import { CreatorLocationSelection } from '@/lib/types';

interface DiscoveredInfluencersProps {
  campaignData?: Campaign | null;
  influencers: DiscoverInfluencer[];
  discoveredCreatorsResults: DiscoveredCreatorsResults | null; 
  isLoading: boolean;
  totalResults: number;
  searchParams: InfluencerSearchFilter;
  onSearchTextChange: (text: string) => void;
  onFilterChange: (filterUpdates: Partial<InfluencerSearchFilter>) => void;
  onApplyFilters: (appliedFilters: Partial<InfluencerSearchFilter>) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onLoadMore: () => void;
  onClearFilters: () => void;
  hasMore: boolean;
  nextBatchSize: number;
  onInfluencerAdded?: () => void;
  shortlistedMembers: CampaignListMember[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  platforms?: Platform[];
  selectedPlatform?: Platform | null;
  onPlatformChange?: (platform: Platform) => void;
  isLoadingPlatforms?: boolean;
}

interface UserhandleResult {
  user_id: string;
  username: string;
  fullname: string;
  picture: string;
  followers: string;
  is_verified: boolean;
}

interface ApiResponse {
  success: boolean;
  data: UserhandleResult[];
  total: number;
  query: string;
  error?: string;
}

const DiscoveredInfluencers: React.FC<DiscoveredInfluencersProps> = ({ 
  campaignData = null,
  influencers,
  discoveredCreatorsResults,
  isLoading,
  totalResults,
  searchParams,
  onSearchTextChange,
  onFilterChange,
  onApplyFilters,
  onSortChange,
  onLoadMore,
  onClearFilters,
  hasMore,
  nextBatchSize,
  onInfluencerAdded,
  shortlistedMembers,
  onPageChange,
  onPageSizeChange,
  platforms = [],
  selectedPlatform = null,
  onPlatformChange,
  isLoadingPlatforms = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Search dropdown states
  const [searchResults, setSearchResults] = useState<UserhandleResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<UserhandleResult | null>(null);
  
  // State for managing add to list operations
  const [addedInfluencers, setAddedInfluencers] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  
  // NEW: Filter Context State for displaying names instead of counts
  const [selectedCreatorLocations, setSelectedCreatorLocations] = useState<CreatorLocationSelection[]>([]);
  const [allFetchedLocations, setAllFetchedLocations] = useState<any[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<{
    creatorLanguage?: { code: string; name: string };
    audienceLanguages?: { code: string; name: string }[];
  }>({});
  const [selectedInterests, setSelectedInterests] = useState<{
    creator?: string[];
    audience?: { value: string; percentage_value: number }[];
  }>({});
  const [selectedHashtags, setSelectedHashtags] = useState<{ name: string }[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<{ name: string }[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<SpecificContactDetail[]>([]);
  
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // NEW: Helper functions for filter context
  const getLocationNameById = (id: string): string => {
    const location = allFetchedLocations.find(loc => loc.id === id) ||
                   selectedCreatorLocations.find(loc => loc.id === id);
    return location?.display_name || location?.name || `Location ${id}`;
  };

  const getLanguageNameByCode = (code: string): string => {
    if (selectedLanguages.creatorLanguage?.code === code) {
      return selectedLanguages.creatorLanguage.name;
    }
    
    const audienceLang = selectedLanguages.audienceLanguages?.find(lang => lang.code === code);
    if (audienceLang) {
      return audienceLang.name;
    }
    
    return code.toUpperCase();
  };

  // NEW: Create filter context for displaying names
  const filterContext: FilterContext = useMemo(() => ({
    selectedCreatorLocations,
    allFetchedLocations,
    getLocationNameById,
    selectedLanguages,
    getLanguageNameByCode,
    selectedInterests,
    selectedHashtags,
    selectedMentions,
    selectedTopics,
    selectedBrands,
    selectedContacts,
  }), [
    selectedCreatorLocations, 
    allFetchedLocations, 
    selectedLanguages, 
    selectedInterests,
    selectedHashtags,
    selectedMentions,
    selectedTopics,
    selectedBrands,
    selectedContacts
  ]);

  // NEW: Handler to update filter context from child components
  const handleFilterContextUpdate = (updates: Partial<FilterContext>) => {
    if (updates.selectedCreatorLocations) {
      setSelectedCreatorLocations(updates.selectedCreatorLocations);
    }
    if (updates.allFetchedLocations) {
      setAllFetchedLocations(updates.allFetchedLocations);
    }
    if (updates.selectedLanguages) {
      setSelectedLanguages(prev => ({ ...prev, ...updates.selectedLanguages }));
    }
    if (updates.selectedInterests) {
      setSelectedInterests(prev => ({ ...prev, ...updates.selectedInterests }));
    }
    if (updates.selectedHashtags) {
      setSelectedHashtags(updates.selectedHashtags);
    }
    if (updates.selectedMentions) {
      setSelectedMentions(updates.selectedMentions);
    }
    if (updates.selectedTopics) {
      setSelectedTopics(updates.selectedTopics);
    }
    if (updates.selectedBrands) {
      setSelectedBrands(updates.selectedBrands);
    }
    if (updates.selectedContacts) {
      setSelectedContacts(updates.selectedContacts);
    }
  };

  // MODIFIED: Enhanced clear filters handler to only reset without triggering API
  const handleClearFilters = () => {
    console.log('🧹 Clearing all filters without API call...');
    
    // Clear filter context state
    setSelectedCreatorLocations([]);
    setAllFetchedLocations([]);
    setSelectedLanguages({});
    setSelectedInterests({});
    setSelectedHashtags([]);
    setSelectedMentions([]);
    setSelectedTopics([]);
    setSelectedBrands([]);
    setSelectedContacts([]);
    
    // Clear search text
    setSearchText('');
    setSelectedInfluencer(null);
    setSearchResults([]);
    setShowSearchDropdown(false);
    setSearchError(null);
    
    // Reset add to list states
    setAddedInfluencers({});
    setIsAdding({});
    
    console.log('✅ All local filter states cleared');
    
    // NOTE: We are NOT calling onClearFilters() here to prevent API call
    // The parent component should handle the actual filter clearing when needed
  };

  // Search userhandles function
  const searchUserhandles = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const cleanQuery = query.replace(/^@/, '');
      const url = `/api/v0/discover/userhandles?q=${encodeURIComponent(cleanQuery)}&type=search&limit=12`;

      console.log('🔍 Searching influencers:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to search influencers');
      }

      console.log(`✅ Found ${data.data.length} influencers`);

      setSearchResults(data.data || []);
      setShowSearchDropdown(data.data.length > 0);

    } catch (error) {
      console.error('❌ Error searching influencers:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search influencers');
      setSearchResults([]);
      setShowSearchDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchText.trim()) {
        searchUserhandles(searchText);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText, searchUserhandles]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    setSelectedInfluencer(null);
  };

  // Handle opening Instagram profile in new tab
  const handleOpenProfile = (influencer: UserhandleResult) => {
    const instagramUrl = `https://www.instagram.com/${influencer.username}`;
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle profile insights (console for now)
  const handleProfileInsights = (influencer: UserhandleResult) => { 
    console.log('handleProfileAnalytics called: ', influencer, selectedPlatform);
    if (!influencer?.user_id || !selectedPlatform?.id) return;
    
    const params = new URLSearchParams({
      user: influencer.user_id,
      username: influencer.username,
      platform: selectedPlatform.work_platform_id,
    });
    
    const url = `/profile-analytics?${params.toString()}`;
    // Open in new tab instead of using router.push
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle add to list from search dropdown
  const handleAddToListFromSearch = (influencer: UserhandleResult) => {
    console.log('Add to List clicked for:', influencer);
    // TODO: Implement add to list functionality
    // This would need to convert UserhandleResult to Influencer format
    // and call the existing handleAddToList function
  };

  // Handle influencer selection
  const handleSelectInfluencer = (influencer: UserhandleResult) => {
    setSelectedInfluencer(influencer);
    setSearchText(`@${influencer.username}`);
    setShowSearchDropdown(false);
    setSearchResults([]);
    
    // You can trigger a search here if needed
    // onSearchTextChange(influencer.username);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchText('');
    setSelectedInfluencer(null);
    setSearchResults([]);
    setShowSearchDropdown(false);
    setSearchError(null);
    searchInputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle add to list function
  const handleAddToList = async (influencer: Influencer) => {


    if (!campaignData || !campaignData.campaign_lists || !campaignData.campaign_lists.length) {
      console.error('No campaign list found');
      return;
    }

    if (!selectedPlatform || !selectedPlatform.id) {
      console.error('No platform selected or platform ID missing');
      return;
    }

    const listId = campaignData.campaign_lists[0].id;
    const platformId = selectedPlatform.id;

    console.log('Adding influencer to list with platform ID:', platformId);

    setIsAdding(prev => ({ ...prev, [influencer.username]: true }));

    try {
      const response = await addInfluencerToList(listId, influencer, platformId);
      
      if (response.success) {
        setAddedInfluencers(prev => ({ ...prev, [influencer.username]: true }));
        console.log('Successfully added influencer to list:', influencer.username);
        
        onInfluencerAdded && onInfluencerAdded();
      } else {
        console.error('Failed to add influencer to list:', response.message);
        alert(`Failed to add ${influencer.name || influencer.username} to list: ${response.message}`);
      }
    } catch (error) {
      console.error('Error adding influencer to list:', error);
      alert(`An error occurred while adding ${influencer.name || influencer.username} to the list`);
    } finally {
      setIsAdding(prev => ({ ...prev, [influencer.username]: false }));
    }
  };

  // Format follower count
  const formatFollowerCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Search Box with Dropdown */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1" ref={searchDropdownRef}>
            {/* Search Input */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search influencers by username..."
                value={searchText}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              
              {/* Search Icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                )}
                {searchText && (
                  <button
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Search Error */}
            {searchError && (
              <div className="mt-2 text-sm text-red-600 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                {searchError}
              </div>
            )}

            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                <div className="p-3">
                  <div className="text-xs font-medium text-gray-500 mb-3 px-2">
                    Found {searchResults.length} influencers
                  </div>
                  
                  {/* Results Grid */}
                  <div className="grid grid-cols-1 gap-2">
                    {searchResults.slice(0, 8).map((result) => (
                      <div
                        key={result.user_id}
                        className="w-full p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 rounded-lg border border-transparent hover:border-purple-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Profile Picture - Clickable */}
                          <div className="relative cursor-pointer" onClick={() => handleOpenProfile(result)}>
                            {result.picture ? (
                              <img
                                src={result.picture}
                                alt={result.username}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-purple-300 transition-colors hover:scale-105"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center hover:scale-105 transition-transform">
                                <span className="text-white font-semibold text-lg">
                                  {result.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            {/* Verified Badge */}
                            {result.is_verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>

                          {/* Influencer Info - Clickable */}
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleOpenProfile(result)}>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors hover:underline">
                                @{result.username}
                              </h4>
                              {result.is_verified && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                  Verified
                                </span>
                              )}
                            </div>
                            
                            {result.fullname && (
                              <p className="text-sm text-gray-600 truncate mt-0.5 hover:underline">
                                {result.fullname}
                              </p>
                            )}
                            
                            {result.followers && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Users size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatFollowerCount(result.followers)} followers
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex-shrink-0 flex items-center space-x-2">
                            {/* Profile Insights Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProfileInsights(result);
                              }}
                              className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                              title="Profile Insights"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-3 w-3 mr-1" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                                />
                              </svg>
                              Profile Insights
                            </button>

                            {/* Add to List Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToListFromSearch(result);
                              }}
                              className="flex items-center px-2 py-1 text-xs text-purple-600 bg-purple-100 hover:bg-purple-200 rounded-md transition-colors"
                              title="Add to List"
                            >
                              Add to List
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* View More */}
                  {searchResults.length > 8 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <span className="text-xs text-gray-500">
                          +{searchResults.length - 8} more results
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Results */}
            {showSearchDropdown && searchResults.length === 0 && searchText.length >= 3 && !isSearching && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No influencers found
                  </h3>
                  <p className="text-xs text-gray-500">
                    Try searching with a different username or keyword
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Filter and Sort Buttons */}
          <div className="flex items-center space-x-2">
            {/* Hamburger menu with toggle functionality */}
            <button 
              className={`p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors ${showFilters ? 'bg-gray-200' : ''}`}
              onClick={toggleFilters}
              aria-label="Toggle filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Filter button */}
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            
            {/* AI Shortlist button */}
            <button className="px-4 py-2 bg-purple-600 text-white rounded-full flex items-center hover:bg-purple-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Shortlist
            </button>
          </div>
        </div>
      </div>
      
      {/* Show filters only if showFilters is true */}
      {showFilters && (
        <DiscoverFilters 
          searchParams={searchParams}
          onFilterChange={onFilterChange}
          onApplyFilters={onApplyFilters}
          onClear={handleClearFilters}
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={onPlatformChange}
          isLoadingPlatforms={isLoadingPlatforms}
          filterContext={filterContext}
        />
      )}
      
      {/* Always show results */}
      <DiscoveredResults 
        selectedPlatform={selectedPlatform}
        influencers={influencers}
        discoveredCreatorsResults={discoveredCreatorsResults}
        isLoading={isLoading}
        totalResults={totalResults}
        sortField={searchParams.sort_by?.field || 'FOLLOWER_COUNT'}
        sortDirection={searchParams.sort_by?.order === 'ASCENDING' ? 'asc' : 'desc'}
        onSortChange={onSortChange}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        nextBatchSize={nextBatchSize}
        campaignData={campaignData}
        onInfluencerAdded={onInfluencerAdded}
        shortlistedMembers={shortlistedMembers}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        currentPage={Math.floor((searchParams.offset || 0) / (searchParams.limit || 20)) + 1}
        pageSize={searchParams.limit || 20}
        onAddToList={handleAddToList}
        addedInfluencers={addedInfluencers}
        isAdding={isAdding}
        setAddedInfluencers={setAddedInfluencers}
      />
    </div>
  );
}

export default DiscoveredInfluencers;