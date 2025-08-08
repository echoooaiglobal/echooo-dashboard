// src/components/dashboard/campaign-funnel/discover/DiscoverTab.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import EmptyState from './EmptyState';
import BrandInfoForm from './BrandInfoForm';
import { Campaign } from '@/types/campaign';
import DiscoveredInfluencers from '@/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers';
import ShortlistedInfluencers from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencers';
import { DiscoverInfluencer } from '@/lib/types';
import { DiscoveredCreatorsResults } from '@/types/insights-iq';
import { getCampaignListMembers, CampaignListMember, CampaignListMembersResponse } from '@/services/campaign/campaign-list.service';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';
import { formatNumber } from '@/utils/format';

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

  // NEW: Platform states
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  // Prepare age group from campaign data
  const defaultFilters = campaignData?.default_filters;
  const creatorInterests = campaignData?.category?.name || '';
  const ageGroup = campaignData?.audience_age_group || '';
  const [left, right] = ageGroup.split('-');

  // Search parameters state using new InfluencerSearchFilter type
  const [searchParams, setSearchParams] = useState<InfluencerSearchFilter>(() => {
    const baseParams: Partial<InfluencerSearchFilter> = {
      work_platform_id: "9bb8913b-ddd9-430b-a66a-d74d846e6c66",
      sort_by: { field: "FOLLOWER_COUNT", order: "DESCENDING" },
      limit: 10, offset: 0, post_type: "ALL",
    };
    
    // Only add default values if defaultFilters is true
    if (defaultFilters) {
      if (left && right && !isNaN(parseInt(left)) && !isNaN(parseInt(right))) {
        baseParams.creator_age = { min: parseInt(left.trim()), max: parseInt(right.trim()) };
      }
      if (creatorInterests) {
        baseParams.creator_interests = [creatorInterests];
      }
    }
    
    return baseParams as InfluencerSearchFilter;
  });

  // NEW: Function to fetch platforms from your API
  const fetchPlatforms = useCallback(async () => {
    setIsLoadingPlatforms(true);
    try {
      console.log('🔄 Fetching platforms from API...');
      
      const response = await fetch('/api/v0/platforms?status=ACTIVE', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch platforms: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setPlatforms(result.data);
        
        // Set default platform (Instagram) if available and no platform is selected
        if (!selectedPlatform && result.data.length > 0) {
          const instagramPlatform = result.data.find((p: Platform) => 
            p.name.toLowerCase().includes('instagram')
          );
          
          if (instagramPlatform) {
            setSelectedPlatform(instagramPlatform);
            console.log('🎯 Default platform set to:', instagramPlatform.name);
            
            // Update search params with the default platform
            setSearchParams(prev => ({
              ...prev,
              work_platform_id: instagramPlatform.work_platform_id
            }));
          }
        }
      } else {
        console.error('❌ Invalid API response:', result);
        setPlatforms([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching platforms:', error);
      setPlatforms([]);
    } finally {
      setIsLoadingPlatforms(false);
    }
  }, [selectedPlatform]);

  // NEW: Function to handle platform change
  const handlePlatformChange = (platform: Platform) => {
    console.log('🎯 Platform changed to:', platform.name, '(Work Platform ID:', platform.work_platform_id, ')');
    
    setSelectedPlatform(platform);
    
    // Update search params with new platform work_platform_id
    setSearchParams(prev => ({
      ...prev,
      work_platform_id: platform.work_platform_id
    }));
    
    // Only trigger new search if we're on the discovered tab and have filters applied
    if (activeFilter === 'discovered' && defaultFilters) {
      const updatedParams = {
        ...searchParams,
        work_platform_id: platform.work_platform_id,
        offset: 0 // Reset to first page when changing platform
      };
      fetchInfluencers(updatedParams);
    }
  };

  // Function to fetch campaign list members (for shortlisted tab)
  const fetchCampaignListMembers = async (page: number = 1, size: number = 10) => {
    if (!campaignData?.campaign_lists || campaignData.campaign_lists.length === 0) {
      console.log('No campaign lists available');
      return;
    }

    const listId = campaignData.campaign_lists[0].id;
    
    setIsLoadingShortlisted(true);
    try {
      console.log('🔄 Fetching campaign list members...');
      
      const response = await getCampaignListMembers(listId, page, size);
      
      if (response.success) {
        setShortlistedMembers(response);
        setShortlistedCount(response.pagination?.total_items || 0);
        setCurrentPage(page);
        console.log('✅ Campaign list members fetched successfully');
      } else {
        console.error('❌ Failed to fetch campaign list members:', response.message);
        setShortlistedMembers(null);
        setShortlistedCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching campaign list members:', error);
      setShortlistedMembers(null);
      setShortlistedCount(0);
    } finally {
      setIsLoadingShortlisted(false);
    }
  };

  // FIXED: Function to fetch discovered influencers with correct API endpoint
  const fetchInfluencers = async (params: InfluencerSearchFilter) => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Fetching influencers with params:', params);
      
      // FIXED: Changed URL from '/api/v0/influencers/discover' to '/api/v0/discover/search'
      const response = await fetch('/api/v0/discover/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch influencers: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setDiscoveredCreatorsResults(result.data);
        setInfluencers(result.data.influencers || []);
        setTotalResults(result.data.total_count || 0);
        console.log('✅ Influencers fetched successfully');
      } else {
        console.error('❌ Failed to fetch influencers:', result.error);
        setInfluencers([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('❌ Error fetching influencers:', error);
      setInfluencers([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle search text changes
  const handleSearchTextChange = (text: string) => {
    // For now, we'll just trigger a search when text is provided
    // In the future, this could be mapped to bio_phrase or other search fields
    if (text.length > 0) {
      const updatedParams = {
        ...searchParams,
        bio_phrase: text, // Map search text to bio phrase for now
        offset: 0 // Reset to first page when searching
      };
      
      setSearchParams(updatedParams);
      setLoadCount(1); // Reset load count when searching
      fetchInfluencers(updatedParams);
    } else {
      // Clear bio_phrase when search is cleared
      const updatedParams = {
        ...searchParams,
        bio_phrase: undefined,
        offset: 0
      };
      
      setSearchParams(updatedParams);
      setLoadCount(1);
      fetchInfluencers(updatedParams);
    }
  };

  // Get next batch size for load more functionality
  const getNextBatchSize = () => {
    const baseSize = searchParams.limit || 10;
    return Math.min(baseSize, totalResults - influencers.length);
  };

  // Load more influencers
  const loadMore = () => {
    const newOffset = influencers.length;
    const updatedParams = {
      ...searchParams,
      offset: newOffset
    };
    
    setSearchParams(updatedParams);
    setLoadCount(loadCount + 1);
    
    // Fetch more influencers and append to existing results
    fetchInfluencersAppend(updatedParams);
  };

  // FIXED: Fetch and append influencers (for load more) with correct API endpoint
  const fetchInfluencersAppend = async (params: InfluencerSearchFilter) => {
    setIsLoading(true);
    
    try {
      // FIXED: Changed URL from '/api/v0/influencers/discover' to '/api/v0/discover/search'
      const response = await fetch('/api/v0/discover/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch more influencers: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Append new influencers to existing ones
        setInfluencers(prev => [...prev, ...(result.data.influencers || [])]);
        console.log('✅ More influencers loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error loading more influencers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedParams: InfluencerSearchFilter = {
      work_platform_id: selectedPlatform?.work_platform_id || "9bb8913b-ddd9-430b-a66a-d74d846e6c66",
      sort_by: { field: "FOLLOWER_COUNT", order: "DESCENDING" },
      limit: 10,
      offset: 0,
      post_type: "ALL"
    };
    
    setSearchParams(clearedParams);
    setLoadCount(1);
    
    // Clear the results
    setInfluencers([]);
    setTotalResults(0);
    setDiscoveredCreatorsResults(null);
  };

  // Function to handle page changes from child component
  const handlePageChange = (page: number) => {
    fetchCampaignListMembers(page, pageSize);
  };

  // Function to handle page size changes from child component
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to page 1 when changing page size
    fetchCampaignListMembers(1, newPageSize);
  };

  // Function to handle discovered influencers page changes
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

  // Function to handle discovered influencers page size changes
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

  // Function to refresh shortlisted influencers (called this after adding/removing)
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

  // Handler for applying filters - this will trigger the API call
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
      sort_by: { field: sortField, order: sortOrder },
      offset: 0 // Reset to first page when sorting
    };
    
    setSearchParams(updatedParams);
    setLoadCount(1); // Reset load count when sorting
    
    // Trigger API call with new sort
    if (activeFilter === 'discovered') {
      fetchInfluencers(updatedParams);
    }
  };

  // NEW: Load platforms when component mounts
  useEffect(() => { 
    if (platforms.length === 0) {
      fetchPlatforms();
    }
  }, [fetchPlatforms]);

  // Fetch campaign list members when campaign data is available
  useEffect(() => {
    if (campaignData?.campaign_lists && campaignData.campaign_lists.length > 0 && !isNewCampaign) {
      fetchCampaignListMembers(1, pageSize); // Start with page 1
    }
  }, [campaignData?.campaign_lists, isNewCampaign]);

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
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-700">Influencers Result</h2>
          {selectedPlatform && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Platform: {selectedPlatform.name}
            </span>
          )}
        </div>
        
        {/* Tab Navigation */}
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
              Discovered ({formatNumber(totalResults) || 0})
            </button>
            <button
              className={`px-6 py-2 text-sm font-medium ${
                activeFilter === 'shortlisted' 
                  ? 'bg-red-300 text-red-800' 
                  : 'text-red-800 hover:bg-red-300'
              }`}
              onClick={() => setActiveFilter('shortlisted')}
            >
              Shortlisted ({formatNumber(shortlistedCount)})
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
          shortlistedMembers={shortlistedMembers?.influencers || []}
          // Platform-related props passed to DiscoveredInfluencers
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={handlePlatformChange}
          isLoadingPlatforms={isLoadingPlatforms}
          // Pagination handlers for discovered influencers
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
          // NEW: Add these props for CSV import functionality
          selectedPlatform={selectedPlatform}
          onInfluencerAdded={refreshShortlistedInfluencers}
        />
      )}
    </div>
  );
};

export default DiscoverTab;