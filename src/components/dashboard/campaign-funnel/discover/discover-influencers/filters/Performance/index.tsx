import React from 'react';
import { IoChevronDown } from 'react-icons/io5';
import Followers from './Followers';
import Engagements from './Engagements';
import Trending from './Trending';
import ReelsPlays from './ReelsPlays';
import { DiscoverSearchParams } from '@/lib/types';

type PerformanceFiltersProps = {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
};

const PerformanceFilters: React.FC<PerformanceFiltersProps> = ({
  filters,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-600 mb-3">
        Performance
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Followers
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('followers')}
          onToggle={() => toggleFilterDropdown('followers')}
        />
        <Engagements
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('engagements')}
          onToggle={() => toggleFilterDropdown('engagements')}
        />
        <Trending
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('trending')}
          onToggle={() => toggleFilterDropdown('trending')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <ReelsPlays
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('reelsPlays')}
          onToggle={() => toggleFilterDropdown('reelsPlays')}
        />
      </div>
    </div>
  );
};

export default PerformanceFilters;