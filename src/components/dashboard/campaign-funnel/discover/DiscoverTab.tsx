// src/components/dashboard/campaign-funnel/discover/DiscoverTab.tsx

'use client';

import { useState, useEffect } from 'react';
import EmptyState from './EmptyState';
import BrandInfoForm from './BrandInfoForm';
import { Campaign } from '@/services/campaign/campaign.service';
import DiscoveredInfluencers from '@/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers';
import ShortlistedInfluencers from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencers';
import { DiscoverInfluencer, DiscoverSearchParams } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';
import { getCampaignListMembers, CampaignListMember, CampaignListMembersResponse } from '@/services/campaign/campaign-list.service';

// Default Pakistan location ID (replace with actual ID from your API)
const PAKISTAN_LOCATION_ID = 307573;

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

  // Search parameters state
  const [searchParams, setSearchParams] = useState<DiscoverSearchParams>({
    audience_source: 'any',
    sort: {
      field: 'followers',
      direction: 'desc'
    },
    filter: {
      ads_brands: [],
      age: { 
        left_number: left?.trim() || '',
        right_number: right?.trim() || '',
      },
      audience_age: [],
      audience_brand: [],
      audience_brand_category: [],
      audience_geo: [],
      audience_lang: {},
      audience_race: { code: '', weight: 0 },
      brand: [],
      brand_category: [],
      audience_source: '',
      engagement_rate: { operator: 'gte', value: null },
      engagements: { left_number: '', right_number: '' },
      followers: { left_number: '50000', right_number: '1000000' },
      reels_plays: { left_number: '', right_number: '' },
      gender: { code: 'FEMALE', weight: 0.3 },
      geo: [{ id: PAKISTAN_LOCATION_ID, weight: 0.5 }],
      keywords: '',
      lang: {},
      last_posted: null,
      relevance: { value: '', weight: '' },
      text: campaignData?.category?.name || '',
      views: { left_number: '', right_number: '' },
      with_contact: [],
      saves: { left_number: '', right_number: '' },
      shares: { left_number: '', right_number: '' },
      account_type: []
    },
    paging: {
      skip: 0,
      limit: 10
    },
    n: 0
  });

  // Debounce the filter changes
  const debouncedFilters = useDebounce(searchParams.filter, 500);

  // Function to fetch campaign list members with pagination
  const fetchCampaignListMembers = async (page: number = 1, size: number = pageSize) => {
    // Check if campaign data exists and has campaign lists
    if (!campaignData?.campaign_lists || campaignData.campaign_lists.length === 0) {
      console.log('No campaign lists found in campaign data');
      return;
    }

    setIsLoadingShortlisted(true);
    try {
      // Get the first campaign list ID from the campaign data
      const listId = campaignData.campaign_lists[0].id;
      console.log('Fetching members for list ID:', listId, 'page:', page, 'pageSize:', size);
      
      const response = await getCampaignListMembers(listId, page, size);
      
      if (response.success) {
        console.log('Campaign list members fetched successfully:', response);
        
        // Directly assign the members without transformation
        setShortlistedMembers(response);
        setShortlistedCount(response.pagination.total_items || 0);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch campaign list members:', response.message);
        setShortlistedMembers(null);
        setShortlistedCount(0);
      }
    } catch (error) {
      console.error('Error fetching campaign list members:', error);
      setShortlistedMembers(null);
      setShortlistedCount(0);
    } finally {
      setIsLoadingShortlisted(false);
    }
  };

  // Function to handle page changes from child component
  const handlePageChange = (page: number) => {
    console.log('Page change requested:', page);
    fetchCampaignListMembers(page, pageSize);
  };

  // Function to handle page size changes from child component
  const handlePageSizeChange = (newPageSize: number) => {
    console.log('Page size change requested:', newPageSize, 'Current pageSize:', pageSize);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to page 1 when changing page size
    // Reset to page 1 when changing page size
    fetchCampaignListMembers(1, newPageSize);
  };

  // Fetch campaign list members when campaign data is available
  useEffect(() => {
    if (campaignData?.campaign_lists && campaignData.campaign_lists.length > 0 && !isNewCampaign) {
      fetchCampaignListMembers(1, pageSize); // Start with page 1
    }
  }, [campaignData?.campaign_lists, isNewCampaign]);

  // Function to refresh shortlisted influencers (call this after adding/removing)
  const refreshShortlistedInfluencers = () => {
    console.log('Refreshing shortlisted influencers...');
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

  // Handler for filter changes 
  const handleFilterChange = (filterUpdates: Partial<DiscoverSearchParams['filter']>) => {
    setSearchParams(prev => ({
      ...prev,
      filter: {
        ...prev.filter,
        ...filterUpdates
      },
      paging: {
        ...prev.paging,
        skip: 0 // Reset to first page when filters change
      },
      n: 0 // Reset n to 0 when filters change
    }));
    setLoadCount(1); // Reset load count when filters change
  };

  // Handler for sort changes
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSearchParams(prev => ({
      ...prev,
      sort: { field, direction },
      paging: {
        ...prev.paging,
        skip: 0 // Reset to first page when sort changes
      },
      n: 0 // Reset n to 0 when sort changes
    }));
    setLoadCount(1); // Reset load count when sort changes
  };

  // Handler for load more
  const loadMore = () => {
    const nextSkip = searchParams.paging.skip + searchParams.paging.limit;
    const nextN = searchParams.n + 2; // Increment n by 2 each time
    const nextLimit = nextN * 10; // Increase the limit by 10 each time
    
    setSearchParams(prev => ({
      ...prev,
      paging: {
        skip: nextSkip,
        limit: nextLimit
      },
      n: nextN
    }));
    
    setLoadCount(prev => prev + 1);
  };

  // Handler for clearing all filters
  const clearAllFilters = () => {
    setSearchParams(prev => ({
      ...prev,
      filter: {
        ...prev.filter,
        text: '',
        gender: { code: '', weight: 0 },
        geo: [],
        followers: { left_number: '', right_number: '' }
      },
      paging: {
        ...prev.paging,
        skip: 0
      },
      n: 0
    }));
    setLoadCount(1); // Reset load count when filters are cleared
  };

  // Fetch influencers when filters, sort, or paging changes
  useEffect(() => {
    const fetchInfluencers = async () => {
      setIsLoading(true);
      try {
        const apiUrl = '/api/discover/influencers';
        console.log('Calling API with filters:', debouncedFilters);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(debouncedFilters),
        });
        
        console.log('API call completed. Status:', response.status);
        
        const data = await response.json();
        console.log('API response data:', data);
        
        // Append new results instead of replacing them, but only if we're not on first page
        if (searchParams.paging.skip > 0) {
          setInfluencers(prevInfluencers => [...prevInfluencers, ...data.influencers]);
        } else {
          // If we're on the first page (after filter change, etc.), replace the results
          setInfluencers(data.influencers);
        }
        
        setTotalResults(data.totalResults);
      } catch (error) {
        console.error('Error fetching influencers:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Only fetch if we're on the discovered tab
    if (activeFilter === 'discovered') {
      fetchInfluencers();
    }
  }, [debouncedFilters, searchParams.sort, searchParams.paging, searchParams.n, activeFilter]);

  // Calculate the next batch size to unlock
  const getNextBatchSize = () => {
    return loadCount * 20;
  };

  // Handle search text change
  const handleSearchTextChange = (text: string) => {
    setSearchParams(prev => ({
      ...prev,
      filter: {
        ...prev.filter,
        text: text
      },
      paging: {
        ...prev.paging,
        skip: 0
      },
      n: 0
    }));
    setLoadCount(1);
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
          isLoading={isLoading}
          totalResults={totalResults}
          searchParams={searchParams}
          onSearchTextChange={handleSearchTextChange}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onLoadMore={loadMore}
          onClearFilters={clearAllFilters}
          hasMore={influencers?.length < totalResults}
          nextBatchSize={getNextBatchSize()}
          onInfluencerAdded={refreshShortlistedInfluencers} // Add this prop to refresh after adding
          shortlistedMembers={shortlistedMembers?.members || []} // Pass the shortlisted members to the discovered influencers
        />
      ) : (
        <ShortlistedInfluencers 
          campaignData={campaignData}
          isLoading={isLoadingShortlisted}
          onInfluencerRemoved={refreshShortlistedInfluencers} // Add this prop to refresh after removing
          onPageChange={handlePageChange} // Pass the pagination handler
          onPageSizeChange={handlePageSizeChange} // Pass the page size change handler
          shortlistedMembers={shortlistedMembers as CampaignListMembersResponse} // Pass the full response object
        />
      )}
    </div>
  );
};

export default DiscoverTab;