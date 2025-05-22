import React from 'react';
import { IoTimeOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface AgeFilterProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Age: React.FC<AgeFilterProps> = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const handleInfluencerAgeChange = (type: 'left_number' | 'right_number', value: string) => {
    onFilterChange({
      age: {
        ...filters.age,
        [type]: value
      }
    });
  };

  const handleAudienceAgeChange = (ages: string[]) => {
    onFilterChange({
      audience_age: ages
    });
  };

  return (
    <FilterComponent
      icon={<IoTimeOutline size={18} />}
      title="Age"
      isOpen={isOpen}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
    >
      <div className="space-y-4 p-3">
        {/* Influencer Age Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Influencer Age</h4>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              min="13"
              max="100"
              value={filters.age?.left_number || ''}
              onChange={(e) => handleInfluencerAgeChange('left_number', e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              placeholder="Max"
              min="13"
              max="100"
              value={filters.age?.right_number || ''}
              onChange={(e) => handleInfluencerAgeChange('right_number', e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        {/* Audience Age Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Audience Age</h4>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              min="13"
              max="100"
              value={filters.audience_age?.[0] || ''}
              onChange={(e) =>
                handleAudienceAgeChange([e.target.value, filters.audience_age?.[1] || ''])
              }
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              placeholder="Max"
              min="13"
              max="100"
              value={filters.audience_age?.[1] || ''}
              onChange={(e) =>
                handleAudienceAgeChange([filters.audience_age?.[0] || '', e.target.value])
              }
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
      </div>
    </FilterComponent>
  );
};

export default Age;
