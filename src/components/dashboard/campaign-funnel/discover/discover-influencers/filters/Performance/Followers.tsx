import React from 'react';
import { IoPersonAddOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface FollowersFilterProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Followers: React.FC<FollowersFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle
}) => {
  const formatNumber = (num: string): string => {
    const number = parseInt(num || '0');
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return number.toString();
  };

  const handleFollowersChange = (type: 'left_number' | 'right_number', value: string) => {
    onFilterChange({
      followers: {
        ...filters.followers,
        [type]: value
      }
    });
  };

  const handlePresetSelect = (min: string, max: string) => {
    onFilterChange({
      followers: {
        left_number: min,
        right_number: max
      }
    });
  };

  return (
    <FilterComponent
      icon={<IoPersonAddOutline size={18} />}
      title="Followers"
      isOpen={isOpen}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
    >
      <div className="space-y-4 p-3">
        {/* From/To Input Fields */}
        <div className="flex items-center space-x-2">
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="number"
              placeholder="1000"
              value={filters.followers?.left_number || ''}
              onChange={(e) => handleFollowersChange('left_number', e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="number"
              placeholder="5000"
              value={filters.followers?.right_number || ''}
              onChange={(e) => handleFollowersChange('right_number', e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        {/* Current Selection Display */}
        {(filters.followers?.left_number || filters.followers?.right_number) && (
          <div className="text-xs text-purple-600">
            Filtering: {filters.followers?.left_number ? `From ${formatNumber(filters.followers.left_number)}` : ''}
            {filters.followers?.right_number ? ` To ${formatNumber(filters.followers.right_number)}` : ''}
          </div>
        )}

        {/* Preset Ranges */}
        <div className="space-y-2 mt-2">
          <h4 className="text-xs font-medium text-gray-500">Quick Select</h4>
          {[
            { label: "Nano (1K-10K)", min: "1000", max: "10000" },
            { label: "Micro (10K-50K)", min: "10000", max: "50000" },
            { label: "Mid-tier (50K-500K)", min: "50000", max: "500000" },
            { label: "Macro (500K-1M)", min: "500000", max: "1000000" },
            { label: "Mega (1M+)", min: "1000000", max: "10000000" }
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => handlePresetSelect(range.min, range.max)}
              className={`w-full text-left p-1 text-sm rounded ${
                filters.followers?.left_number === range.min &&
                filters.followers?.right_number === range.max
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </FilterComponent>
  );
};

export default Followers;
