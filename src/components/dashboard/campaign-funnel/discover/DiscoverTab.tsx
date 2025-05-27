// src/components/dashboard/campaign-funnel/discover/DiscoverTab.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import EmptyState from './EmptyState';
import BrandInfoForm from './BrandInfoForm';
import { Campaign } from '@/services/campaign/campaign.service';
import DiscoveredInfluencers from '@/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers';
import ShortlistedInfluencers from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencers';
import { DiscoverInfluencer } from '@/lib/types';
import { DiscoveredCreatorsResults } from '@/types/insights-iq';
import { getCampaignListMembers, CampaignListMember, CampaignListMembersResponse } from '@/services/campaign/campaign-list.service';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

// Default Pakistan location ID (replace with actual ID from your API)
const PAKISTAN_LOCATION_ID = "abd21c98-2950-45cd-b224-89b5a9f3c014";

interface DiscoverTabProps {
  campaignData?: Campaign | null;
  isNewCampaign?: boolean;
  onCampaignCreated?: (campaign: Campaign) => void;
}

const DiscoverTab: React.FC<DiscoverTabProps> = ({ 
  campaignData = null,
  isNewCampaign = false,
  onCampaignCreated
}) => {
  const [activeFilter, setActiveFilter] = useState<'discovered' | 'shortlisted'>('discovered');
  const [showBrandForm, setShowBrandForm] = useState(isNewCampaign);
  
  // States for discovered influencers
  const [influencers, setInfluencers] = useState<DiscoverInfluencer[]>([]);
  const [discoveredCreatorsResults, setDiscoveredCreatorsResults] = useState<DiscoveredCreatorsResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [loadCount, setLoadCount] = useState(1);
  
  // States for shortlisted influencers - directly using CampaignListMember
  const [shortlistedMembers, setShortlistedMembers] = useState<CampaignListMembersResponse | null>(null);
  const [isLoadingShortlisted, setIsLoadingShortlisted] = useState(false);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Prepare age group from campaign data
  const ageGroup = campaignData?.audience_age_group || '';
  const [left, right] = ageGroup.split('-');

  // Search parameters state using new InfluencerSearchFilter type
  const [searchParams, setSearchParams] = useState<InfluencerSearchFilter>({
    work_platform_id: "9bb8913b-ddd9-430b-a66a-d74d846e6c66", // Instagram platform ID
    audience_gender: {
      type: "ANY",
      operator: "GT",
      percentage_value: 0
    },
    creator_age: {
      min: parseInt(left?.trim() || '18'),
      max: parseInt(right?.trim() || '35')
    },
    creator_locations: [],
    creator_account_type: ["CREATOR"],
    sort_by: {
      field: "FOLLOWER_COUNT",
      order: "DESCENDING"
    },
    limit: 20,
    offset: 0,
    post_type: "ALL",
  });

  // Function to fetch influencers - make it a useCallback to prevent unnecessary re-renders
  const fetchInfluencers = useCallback(async (params: InfluencerSearchFilter) => {
    setIsLoading(true);
    try {
      const apiUrl = '/api/v0/discover/search';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      const data = await response.json();
      console.log('API response data:', data);
      
      // Always replace results for pagination (don't append)
      setDiscoveredCreatorsResults(data);
      setTotalResults(data?.metadata?.total_results || 0);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch campaign list members with pagination
  const fetchCampaignListMembers = async (page: number = 1, size: number = pageSize) => {
    // Check if campaign data exists and has campaign lists
    if (!campaignData?.campaign_lists || campaignData.campaign_lists.length === 0) {
      return;
    }

    setIsLoadingShortlisted(true);
    try {
      // Get the first campaign list ID from the campaign data
      const listId = campaignData.campaign_lists[0].id;
      
      const response = await getCampaignListMembers(listId, page, size);
      
      if (response.success) {
        
        // Directly assign the members without transformation
        setShortlistedMembers(response);
        setShortlistedCount(response.pagination.total_items || 0);
        setCurrentPage(page);
      } else {
        setShortlistedMembers(null);
        setShortlistedCount(0);
      }
    } catch (error) {
      setShortlistedMembers(null);
      setShortlistedCount(0);
    } finally {
      setIsLoadingShortlisted(false);
    }
  };

  // Function to handle page changes from child component
  const handlePageChange = (page: number) => {
    fetchCampaignListMembers(page, pageSize);
  };

  // Function to handle page size changes from child component
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to page 1 when changing page size
    // Reset to page 1 when changing page size
    fetchCampaignListMembers(1, newPageSize);
  };

  // NEW: Function to handle discovered influencers page changes
  const handleDiscoveredPageChange = (page: number) => {
    const newOffset = (page - 1) * (searchParams.limit || 20);
    
    const updatedParams = {
      ...searchParams,
      offset: newOffset
    };
    
    setSearchParams(updatedParams);
    
    // Trigger API call with new pagination
    if (activeFilter === 'discovered') {
      fetchInfluencers(updatedParams);
    }
  };

  // NEW: Function to handle discovered influencers page size changes
  const handleDiscoveredPageSizeChange = (newPageSize: number) => {
    
    const updatedParams = {
      ...searchParams,
      offset: 0, // Reset to first page when changing page size
      limit: newPageSize
    };
    
    setSearchParams(updatedParams);
    
    // Trigger API call with new page size
    if (activeFilter === 'discovered') {
      fetchInfluencers(updatedParams);
    }
  };

  // Initial load of influencers when component mounts
  useEffect(() => {
    // Only fetch if we're on the discovered tab and it's not a new campaign
    if (activeFilter === 'discovered' && campaignData && !isNewCampaign) {
      fetchInfluencers(searchParams);
    }
  }, [activeFilter, campaignData, isNewCampaign, fetchInfluencers]);

  // Fetch campaign list members when campaign data is available
  useEffect(() => {
    if (campaignData?.campaign_lists && campaignData.campaign_lists.length > 0 && !isNewCampaign) {
      fetchCampaignListMembers(1, pageSize); // Start with page 1
    }
  }, [campaignData?.campaign_lists, isNewCampaign]);

  // Function to refresh shortlisted influencers (call this after adding/removing)
  const refreshShortlistedInfluencers = () => {
    // Refresh the current page to maintain pagination state
    fetchCampaignListMembers(currentPage, pageSize);
  };

  // Function to handle starting the discovery process
  const handleStartDiscovery = () => {
    setShowBrandForm(true);
  };

  // Function to handle form completion - FIXED to properly handle campaign with ID
  const handleFormComplete = (formData: Campaign) => {
    console.log('Form submitted with data:', formData);
    
    // For new campaigns, call the parent handler with the complete campaign object
    // that includes the ID from the API response
    if (isNewCampaign && onCampaignCreated) {
      // This will now have the campaign ID from the API response
      onCampaignCreated(formData);
    } else {
      // For existing campaigns, hide the form and show influencers
      setShowBrandForm(false);
    }
  };

  // Handler for filter changes - UPDATE: This now only updates state, doesn't trigger API call
  const handleFilterChange = (filterUpdates: Partial<InfluencerSearchFilter>) => {
    setSearchParams(prev => ({
      ...prev,
      ...filterUpdates,
      offset: 0 // Reset to first page when filters change
    }));
    setLoadCount(1); // Reset load count when filters change
  };

  // NEW: Handler for applying filters - this will trigger the API call
  const handleApplyFilters = (appliedFilters: Partial<InfluencerSearchFilter>) => {
    const updatedParams = {
      ...searchParams,
      ...appliedFilters,
      offset: 0 // Reset to first page when filters are applied
    };
    
    setSearchParams(updatedParams);
    setLoadCount(1); // Reset load count when filters are applied
    
    // Trigger the API call with new filters
    if (activeFilter === 'discovered') {
      fetchInfluencers(updatedParams);
    }
  };

  // Handler for sort changes
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    // Map the field and direction to the new sort format
    const sortField = field.toUpperCase() as any; // Convert to uppercase for API

    // Explicitly cast to SortOrder type
    type SortOrder = 'ASCENDING' | 'DESCENDING';
    const sortOrder: SortOrder = direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    
    const updatedParams = {
      ...searchParams,
      sort_by: { 
        field: sortField, 
        order: sortOrder 
      },
      offset: 0 // Reset to first page when sort changes
    };
    
    setSearchParams(updatedParams);
    setLoadCount(1); // Reset load count when sort changes
    
    // Trigger API call for sort changes
    if (activeFilter === 'discovered') {
      fetchInfluencers(updatedParams);
    }
  };

  // Handler for load more (if still needed)
  const loadMore = () => {
    const currentLimit = searchParams.limit || 20;
    const currentOffset = searchParams.offset || 0;
    const nextOffset = currentOffset + currentLimit;
    
    const updatedParams = {
      ...searchParams,
      offset: nextOffset
    };
    
    setSearchParams(updatedParams);
    setLoadCount(prev => prev + 1);
    
    // Trigger API call for load more
    if (activeFilter === 'discovered') {
      fetchInfluencers(updatedParams);
    }
  };

  // Handler for clearing all filters
  const handleClearFilters = () => {
    const clearedParams: InfluencerSearchFilter = {
      work_platform_id: "9bb8913b-ddd9-430b-a66a-d74d846e6c66",
      follower_count: {
        min: 1000,
        max: 10000000
      },
      audience_gender: {
        type: "ANY",
        operator: "GT",
        percentage_value: 0
      },
      creator_gender: "ANY",
      creator_locations: [],
      sort_by: {
        field: "FOLLOWER_COUNT",
        order: "DESCENDING"
      },
      limit: searchParams.limit || 20,
      offset: 0,
      audience_source: "ANY",
      has_audience_info: false,
      exclude_private_profiles: false
    };
    
    setSearchParams(clearedParams);
    setLoadCount(1); // Reset load count when filters are cleared
    
    // Trigger API call with cleared filters
    if (activeFilter === 'discovered') {
      fetchInfluencers(clearedParams);
    }
  };

  // Calculate the next batch size to unlock
  const getNextBatchSize = () => {
    return loadCount * 20;
  };

  // Handle search text change - UPDATE: This still triggers immediately for search
  const handleSearchTextChange = (text: string) => {
    const updatedParams = {
      ...searchParams,
      description_keywords: text,
      offset: 0
    };
    
    setSearchParams(updatedParams);
    setLoadCount(1);
    
    // Trigger API call for search (search should still be immediate)
    if (activeFilter === 'discovered') {
      fetchInfluencers(updatedParams);
    }
  };

  // If the brand form is being shown, display it
  if (showBrandForm) {
    return (
      <div className="py-8">
        <BrandInfoForm 
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  // If no influencers are discovered yet, show the empty state
  if (!campaignData && isNewCampaign) {
    return <EmptyState onStartDiscovery={handleStartDiscovery} />;
  }

  // Show influencer results
  return (
    <div>
      {/* Heading and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Influencers Result</h2>
        
        {/* Filter Buttons */}
        <div className="flex mt-3 md:mt-0">
          <div className="bg-red-200 rounded-full flex overflow-hidden">
            <button
              className={`px-6 py-2 text-sm font-medium ${
                activeFilter === 'discovered' 
                  ? 'bg-red-300 text-red-800' 
                  : 'text-red-800 hover:bg-red-300'
              }`}
              onClick={() => setActiveFilter('discovered')}
            >
              Discovered Influencer ({totalResults || 450})
            </button>
            <button
              className={`px-6 py-2 text-sm font-medium ${
                activeFilter === 'shortlisted' 
                  ? 'bg-red-300 text-red-800' 
                  : 'text-red-800 hover:bg-red-300'
              }`}
              onClick={() => setActiveFilter('shortlisted')}
            >
              Shortlisted ({shortlistedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeFilter === 'discovered' ? (
        <DiscoveredInfluencers 
          campaignData={campaignData}
          influencers={influencers}
          discoveredCreatorsResults={discoveredCreatorsResults}
          isLoading={isLoading}
          totalResults={totalResults}
          searchParams={searchParams}
          onSearchTextChange={handleSearchTextChange}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onSortChange={handleSortChange}
          onLoadMore={loadMore}
          onClearFilters={handleClearFilters}
          hasMore={influencers?.length < totalResults}
          nextBatchSize={getNextBatchSize()}
          onInfluencerAdded={refreshShortlistedInfluencers}
          shortlistedMembers={shortlistedMembers?.members || []}
          // NEW: Add pagination handlers for discovered influencers
          onPageChange={handleDiscoveredPageChange}
          onPageSizeChange={handleDiscoveredPageSizeChange}
        />
      ) : (
        <ShortlistedInfluencers 
          campaignData={campaignData}
          isLoading={isLoadingShortlisted}
          onInfluencerRemoved={refreshShortlistedInfluencers}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          shortlistedMembers={shortlistedMembers as CampaignListMembersResponse}
        />
      )}
    </div>
  );
};

export default DiscoverTab;