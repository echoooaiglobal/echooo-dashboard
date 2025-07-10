// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/index.tsx
import React from 'react';
import { IoChevronDown } from 'react-icons/io5';
import BioPhrase from './BioPhrase';
import TopicsAI from './TopicsAI';
import Hashtags from './Hashtags';
import LookalikeAI from './LookalikeAI';
import Mentions from './Mentions';
import Interests from './Interests';
import CaptionKeyword from './CaptionKeyword';
import Partnerships from './Partnerships';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

type ContentFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
  onCloseFilter: () => void;
};

const ContentFilters: React.FC<ContentFiltersProps> = ({
  searchParams,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen,
  onCloseFilter
}) => {

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-600 mb-3">Content</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <BioPhrase
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('bioPhrase')}
          onToggle={() => toggleFilterDropdown('bioPhrase')}
          onCloseFilter={onCloseFilter}
        />
        
        <TopicsAI
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('topicsAI')}
          onToggle={() => toggleFilterDropdown('topicsAI')}
          onCloseFilter={onCloseFilter}
        />
        
        <LookalikeAI
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('lookalikeAI')}
          onToggle={() => toggleFilterDropdown('lookalikeAI')}
          onCloseFilter={onCloseFilter}
        />

        <Hashtags
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('hashtags')}
          onToggle={() => toggleFilterDropdown('hashtags')}
          onCloseFilter={onCloseFilter}
        />
        
        <Interests
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('interests')}
          onToggle={() => toggleFilterDropdown('interests')}
          onCloseFilter={onCloseFilter}
        />
        
        <Mentions
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('mentions')}
          onToggle={() => toggleFilterDropdown('mentions')}
          onCloseFilter={onCloseFilter}
        />
        
        
      </div>
      
      {/* Partnerships row - 2 items side by side */}
      <div className="grid grid-cols-3 gap-4">
        <CaptionKeyword
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('captionKeyword')}
          onToggle={() => toggleFilterDropdown('captionKeyword')}
          onCloseFilter={onCloseFilter}
        />
        <Partnerships
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('partnerships1')}
          onToggle={() => toggleFilterDropdown('partnerships1')}
          onCloseFilter={onCloseFilter}
        />
      </div>
    </div>
  );
};

export default ContentFilters;