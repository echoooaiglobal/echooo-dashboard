// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers.tsx
'use client';

import { useState } from 'react';
import { Search } from 'react-feather';
import DiscoverFilters from './DiscoverFilters';
import DiscoveredResults from './DiscoveredResults';
import { DiscoverInfluencer, DiscoverSearchParams } from '@/lib/types';
import { Campaign } from '@/services/campaign/campaign.service';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';

interface DiscoveredInfluencersProps {
  campaignData?: Campaign | null;
  influencers: DiscoverInfluencer[];
  isLoading: boolean;
  totalResults: number;
  searchParams: DiscoverSearchParams;
  onSearchTextChange: (text: string) => void;
  onFilterChange: (filterUpdates: Partial<DiscoverSearchParams['filter']>) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onLoadMore: () => void;
  onClearFilters: () => void;
  hasMore: boolean;
  nextBatchSize: number;
  onInfluencerAdded?: () => void;
  shortlistedMembers: CampaignListMember[];
}

const DiscoveredInfluencers: React.FC<DiscoveredInfluencersProps> = ({ 
  campaignData = null,
  influencers,
  isLoading,
  totalResults,
  searchParams,
  onSearchTextChange,
  onFilterChange,
  onSortChange,
  onLoadMore,
  onClearFilters,
  hasMore,
  nextBatchSize,
  onInfluencerAdded,
  shortlistedMembers
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');

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
          filters={searchParams.filter}
          audience_source={searchParams.audience_source}
          onFilterChange={onFilterChange}
          onClear={onClearFilters}
        />
      )}
      
      {/* Always show results */}
      <DiscoveredResults 
        influencers={influencers}
        isLoading={isLoading}
        totalResults={totalResults}
        sortField={searchParams.sort.field}
        sortDirection={searchParams.sort.direction}
        onSortChange={onSortChange}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        nextBatchSize={nextBatchSize}
        campaignData={campaignData}
        onInfluencerAdded={onInfluencerAdded}
        shortlistedMembers={shortlistedMembers}
      />
    </div>
  );
}

export default DiscoveredInfluencers;