// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Demographics/index.tsx
import React, { useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import Location from './Location';
import Gender from './Gender';
import Language from './Language';
import Age from './Age';
import AudienceType from './AudienceType';
import Ethnicity from './Ethnicity';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { CreatorLocationSelection } from '@/lib/types';

type DemographicsFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
};

const DemographicsFilters: React.FC<DemographicsFiltersProps> = ({
  searchParams,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen
}) => {
  // Local state for location selections (for UI display)
  const [selectedLocations, setSelectedLocations] = useState<CreatorLocationSelection[]>([]);

  // Update local state when creator_locations changes from parent
  React.useEffect(() => {
    if (searchParams.creator_locations && searchParams.creator_locations.length > 0) {
      // If we have creator_locations but no local selections with names, 
      // keep the existing selections if they have proper names, 
      // otherwise create basic objects (names will be updated when user searches)
      if (selectedLocations.length === 0 || 
          selectedLocations.some(loc => loc.name.startsWith('Location '))) {
        const locationsFromParams = searchParams.creator_locations.map(id => {
          // Check if we already have this location with proper data
          const existing = selectedLocations.find(loc => loc.id === id);
          if (existing && !existing.name.startsWith('Location ')) {
            return existing;
          }
          return {
            id,
            name: `Location ${id}`, // Fallback name, will be updated when user searches
            display_name: undefined,
            type: undefined
          };
        });
        setSelectedLocations(locationsFromParams);
      }
    } else if (!searchParams.creator_locations || searchParams.creator_locations.length === 0) {
      setSelectedLocations([]);
    }
  }, [searchParams.creator_locations]);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-600 mb-3">
        Demographics
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <Location
          selectedLocations={selectedLocations}
          onSelect={setSelectedLocations}
          isOpen={isFilterOpen('location')}
          onToggle={() => toggleFilterDropdown('location')}
          searchParams={searchParams}
          onFilterChange={onFilterChange}
        />
        
        <Gender 
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('gender')}
          onToggle={() => toggleFilterDropdown('gender')}
        />
        
        <Language
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('language')}
          onToggle={() => toggleFilterDropdown('language')}
        />
        
        <Age
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('age')}
          onToggle={() => toggleFilterDropdown('age')}
        />
        
        <AudienceType
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('audienceType')}
          onToggle={() => toggleFilterDropdown('audienceType')}
        />
      </div>
    </div>
  );
};

export default DemographicsFilters;