import React from 'react';
import { IoChevronDown } from 'react-icons/io5';
import Location from './Location';
import Gender from './Gender';
import Language from './Language';
import Age from './Age';
import AudienceType from './AudienceType';
import Ethnicity from './Ethnicity';
import { DiscoverSearchParams } from '@/lib/types';

type DemographicsFiltersProps = {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
};

const DemographicsFilters: React.FC<DemographicsFiltersProps> = ({
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
        Demographics
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <Location
          type="influencer"
          selectedLocations={filters.geo}
          onSelect={(locations: string[]) => 
            onFilterChange({ geo: locations })
          }
          isOpen={isFilterOpen('location')}
          onToggle={() => toggleFilterDropdown('location')}
        />
        
        <Gender 
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('gender')}
          onToggle={() => toggleFilterDropdown('gender')}
        />
        
        <Language
          selectedLanguages={filters.languages || []}
          onSelect={(languages: string[]) => 
            onFilterChange({ languages })
          }
          isOpen={isFilterOpen('language')}
          onToggle={() => toggleFilterDropdown('language')}
        />
        
        <Age
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('age')}
          onToggle={() => toggleFilterDropdown('age')}
        />
        
        <AudienceType
          audienceSource={filters.audience_source}
          onChange={(audience_source) => 
            onFilterChange({ audience_source })
          }
          isOpen={isFilterOpen('audienceType')}
          onToggle={() => toggleFilterDropdown('audienceType')}
        />
        
        <Ethnicity
          filters={filters}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('ethnicity')}
          onToggle={() => toggleFilterDropdown('ethnicity')}
        />
      </div>
    </div>
  );
};

export default DemographicsFilters;