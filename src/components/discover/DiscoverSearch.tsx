'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import DiscoverFilters from './DiscoverFilters';
import DiscoverResults from './DiscoverResults';
import { DiscoverInfluencer, DiscoverSearchParams } from '@/lib/types';

// Default Pakistan location ID (replace with actual ID from your API)
const PAKISTAN_LOCATION_ID = 307573;

export default function DiscoverSearch() {
  const [searchParams, setSearchParams] = useState<DiscoverSearchParams>({
    audience_source: 'any',
    sort: {
      field: 'followers',
      direction: 'desc'
    },
    filter: {
      ads_brands: [],
      age: { left_number: '', right_number: '' },
      audience_age: [],
      audience_brand: [],
      audience_brand_category: [],
      audience_gender: { code: '', weight: 0 },
      audience_geo: [],
      audience_lang: {},
      audience_race: { code: '', weight: 0 },
      brand: [],
      brand_category: [],
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
      text: 'fashion',
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
    n: 0 // Adding the n parameter with initial value of 0
  });

  const [influencers, setInfluencers] = useState<DiscoverInfluencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [loadCount, setLoadCount] = useState(1); // Track how many times "load more" has been clicked
  
  // Debounce only the filter changes, not paging/sort
  const debouncedFilters = useDebounce(searchParams.filter, 500);

  useEffect(() => {
    const fetchInfluencers = async () => {
      setIsLoading(true);
      try {
        const apiUrl = '/api/discover/influencers';
        console.log('Attempting to call API at:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...searchParams,
            filter: debouncedFilters
          }),
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
  
    fetchInfluencers();
  }, [debouncedFilters, searchParams.sort, searchParams.paging, searchParams.n]);

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

  // Calculate the next batch size to unlock
  const getNextBatchSize = () => {
    return loadCount * 20;
  };

  return (
    <div className="space-y-6">
      <DiscoverFilters 
        filters={searchParams.filter}
        onFilterChange={handleFilterChange}
        onClear={clearAllFilters}
      />
      
      <DiscoverResults 
        influencers={influencers}
        isLoading={isLoading}
        totalResults={totalResults}
        sortField={searchParams.sort.field}
        sortDirection={searchParams.sort.direction}
        onSortChange={handleSortChange}
        onLoadMore={loadMore}
        hasMore={influencers?.length < totalResults}
        nextBatchSize={getNextBatchSize()} // Pass the dynamic batch size to the results component
      />
    </div>
  );
}