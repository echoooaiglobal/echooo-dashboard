// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers.tsx
'use client';

import { useState } from 'react';
import { Search } from 'react-feather';
import DiscoverFilters from './DiscoverFilters';
import DiscoveredResults from './DiscoveredResults';
import { DiscoverInfluencer } from '@/lib/types';
import { Campaign } from '@/services/campaign/campaign.service';
import { CampaignListMember, addInfluencerToList } from '@/services/campaign/campaign-list.service';
import { DiscoveredCreatorsResults, Influencer } from '@/types/insights-iq';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';

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
  // NEW: Platform-related props
  platforms?: Platform[];
  selectedPlatform?: Platform | null;
  onPlatformChange?: (platform: Platform) => void;
  isLoadingPlatforms?: boolean;
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
  // NEW: Platform props
  platforms = [],
  selectedPlatform = null,
  onPlatformChange,
  isLoadingPlatforms = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.description_keywords || '');
  // NEW: State for managing add to list operations
  const [addedInfluencers, setAddedInfluencers] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    onSearchTextChange(text);
  };

  // NEW: Moved handleAddToList function from DiscoveredResults
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
    const platformId = selectedPlatform.id; // Use selectedPlatform.id instead of hardcoded value

    console.log('Adding influencer to list with platform ID:', platformId);

    // Set adding state for this influencer
    setIsAdding(prev => ({ ...prev, [influencer.username]: true }));

    try {
      const response = await addInfluencerToList(listId, influencer, platformId);
      
      if (response.success) {
        // Update state to show influencer is added
        setAddedInfluencers(prev => ({ ...prev, [influencer.username]: true }));
        console.log('Successfully added influencer to list:', influencer.username);
        
        // Call the callback to refresh shortlisted members
        onInfluencerAdded && onInfluencerAdded();
      } else {
        console.error('Failed to add influencer to list:', response.message);
        // Optionally show an error message to the user
        alert(`Failed to add ${influencer.name || influencer.username} to list: ${response.message}`);
      }
    } catch (error) {
      console.error('Error adding influencer to list:', error);
      // Optionally show an error message to the user
      alert(`An error occurred while adding ${influencer.name || influencer.username} to the list`);
    } finally {
      // Clear adding state
      setIsAdding(prev => ({ ...prev, [influencer.username]: false }));
    }
  };

  console.log('selectedPlatform', selectedPlatform);

  return (
    <div className="space-y-6">
      {/* Search Box with Buttons */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Influencer"
              value={searchText}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {/* Search icon on the right side */}
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Filter and Sort Buttons */}
          <div className="flex items-center space-x-2">
            {/* Hamburger menu with toggle functionality */}
            <button 
              className={`p-2 rounded-full border border-gray-300 hover:bg-gray-100 ${showFilters ? 'bg-gray-200' : ''}`}
              onClick={toggleFilters}
              aria-label="Toggle filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Filter button */}
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            
            {/* AI Shortlist button */}
            <button className="px-4 py-2 bg-purple-600 text-white rounded-full flex items-center hover:bg-purple-700">
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
          onClear={onClearFilters}
          // NEW: Pass platform-related props to filters
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={onPlatformChange}
          isLoadingPlatforms={isLoadingPlatforms}
        />
      )}
      
      {/* Always show results */}
      <DiscoveredResults 
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
        // NEW: Pass the handleAddToList function and related state
        onAddToList={handleAddToList}
        addedInfluencers={addedInfluencers}
        isAdding={isAdding}
        setAddedInfluencers={setAddedInfluencers}
      />
    </div>
  );
}

export default DiscoveredInfluencers;