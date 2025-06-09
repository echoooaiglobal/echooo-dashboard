// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/index.tsx
import React from 'react';
import { IoChevronDown } from 'react-icons/io5';
import Followers from './Followers';
import Engagements from './Engagements';
import Trending from './Trending';
import ReelsPlays from './ReelsPlays';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

type PerformanceFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
};

const PerformanceFilters: React.FC<PerformanceFiltersProps> = ({
  searchParams,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen
}) => {

  // Enhanced filter change handler with logging
  // const handleFilterChange = (updates: Partial<InfluencerSearchFilter>) => {  
  //   // Call the parent's filter change handler
  //   onFilterChange(updates);
  // };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-600 mb-3">
        Performance
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Followers
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('followers')}
          onToggle={() => toggleFilterDropdown('followers')}
        />
        
        <Trending
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('trending')}
          onToggle={() => toggleFilterDropdown('trending')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Engagements
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('engagements')}
          onToggle={() => toggleFilterDropdown('engagements')}
        />
        <ReelsPlays
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('reelsPlays')}
          onToggle={() => toggleFilterDropdown('reelsPlays')}
        />
      </div>
    </div>
  );
};

export default PerformanceFilters;