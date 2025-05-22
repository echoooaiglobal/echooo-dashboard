import React from 'react';
import { IoHeartOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface EngagementsFilterProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Engagements: React.FC<EngagementsFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle
}) => {
  // Engagement rate options from 1% to 20% in 1% increments
  const engagementRateOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleEngagementRangeChange = (type: 'left_number' | 'right_number', value: string) => {
    onFilterChange({
      engagements: {
        ...filters.engagements,
        [type]: value
      }
    });
  };

  const handleEngagementRateChange = (value: number) => {
    onFilterChange({
      engagement_rate: {
        operator: '>',
        value: value / 100 // Convert to decimal
      }
    });
  };

  return (
    <FilterComponent
      icon={<IoHeartOutline size={18} />}
      title="Engagements"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4 p-3">
        {/* Influencer Engagement Range */}
        <div>
          <h4 className="text-sm font-medium mb-2">Influencer Engagements</h4>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="From"
              min="0"
              value={filters.engagements?.left_number || ''}
              onChange={(e) => handleEngagementRangeChange('left_number', e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              placeholder="To"
              min="0"
              value={filters.engagements?.right_number || ''}
              onChange={(e) => handleEngagementRangeChange('right_number', e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        {/* Engagement Rate Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Engagement Rate</h4>
          <select
            value={filters.engagement_rate?.value ? Math.round(filters.engagement_rate.value * 100) : ''}
            onChange={(e) => handleEngagementRateChange(Number(e.target.value))}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">Select minimum rate</option>
            {engagementRateOptions.map((percent) => (
              <option key={percent} value={percent}>
                &gt;{percent}%
              </option>
            ))}
          </select>
        </div>

        {/* Current Selection Display */}
        {(filters.engagements?.left_number || filters.engagements?.right_number || filters.engagement_rate?.value) && (
          <div className="text-xs text-purple-600 mt-2">
            Filtering: 
            {filters.engagements?.left_number && ` From ${filters.engagements.left_number}`}
            {filters.engagements?.right_number && ` To ${filters.engagements.right_number}`}
            {filters.engagement_rate?.value && ` Rate >${Math.round(filters.engagement_rate.value * 100)}%`}
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default Engagements;
