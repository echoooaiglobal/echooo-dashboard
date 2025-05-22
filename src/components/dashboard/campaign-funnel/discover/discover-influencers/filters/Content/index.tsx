import React from 'react';
import { IoChevronDown } from 'react-icons/io5';
import NicheAI from './NicheAI';
import TopicsAI from './TopicsAI';
import LookalikeAI from './LookalikeAI';
import Mentions from './Mentions';
import Interests from './Interests';
import CaptionKeyword from './CaptionKeyword';
import Partnerships from './Partnerships';
import { DiscoverSearchParams } from '@/lib/types';

type ContentFiltersProps = {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
};

const ContentFilters: React.FC<ContentFiltersProps> = ({
  filters,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-600 mb-3">Content</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <NicheAI
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('nicheAI')}
          onToggle={() => toggleFilterDropdown('nicheAI')}
        />
        
        <TopicsAI
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('topicsAI')}
          onToggle={() => toggleFilterDropdown('topicsAI')}
        />
        
        <LookalikeAI
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('lookalikeAI')}
          onToggle={() => toggleFilterDropdown('lookalikeAI')}
        />
        
        <Mentions
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('mentions')}
          onToggle={() => toggleFilterDropdown('mentions')}
        />
        
        <Interests
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('interests')}
          onToggle={() => toggleFilterDropdown('interests')}
        />
        
        <CaptionKeyword
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('captionKeyword')}
          onToggle={() => toggleFilterDropdown('captionKeyword')}
        />
      </div>
      
      {/* Partnerships row - 2 items side by side */}
      <div className="grid grid-cols-2 gap-4">
        <Partnerships
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('partnerships1')}
          onToggle={() => toggleFilterDropdown('partnerships1')}
        />
        <Partnerships
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('partnerships2')}
          onToggle={() => toggleFilterDropdown('partnerships2')}
        />
      </div>
    </div>
  );
};

export default ContentFilters;