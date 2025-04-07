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
      skip: 10,
      limit: 20
    }
  });

  const [influencers, setInfluencers] = useState<DiscoverInfluencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
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
        
        setInfluencers(data.influencers);
        setTotalResults(data.totalResults);
      } catch (error) {
        console.error('Error fetching influencers:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchInfluencers();
  }, [debouncedFilters, searchParams.sort, searchParams.paging]);

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
      }
    }));
  };

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSearchParams(prev => ({
      ...prev,
      sort: { field, direction }
    }));
  };

  const loadMore = () => {
    setSearchParams(prev => ({
      ...prev,
      paging: {
        ...prev.paging,
        skip: prev.paging.skip + prev.paging.limit
      }
    }));
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
      }
    }));
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
      />
    </div>
  );
}