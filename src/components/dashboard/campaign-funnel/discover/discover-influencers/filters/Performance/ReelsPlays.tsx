import React from 'react';
import { IoPlayOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface ReelsPlaysProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ReelsPlays: React.FC<ReelsPlaysProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle
}) => {
  const handlePlaysChange = (type: 'left_number' | 'right_number', value: string) => {
    onFilterChange({
      reels_plays: {
        ...filters.reels_plays,
        [type]: value
      }
    });
  };

  return (
    <FilterComponent
      icon={<IoPlayOutline size={18} />}
      title="Reels Plays"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 p-3">
        {/* From Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="number"
            placeholder="Min plays"
            min="0"
            value={filters.reels_plays?.left_number || ''}
            onChange={(e) => handlePlaysChange('left_number', e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* To Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="number"
            placeholder="Max plays"
            min="0"
            value={filters.reels_plays?.right_number || ''}
            onChange={(e) => handlePlaysChange('right_number', e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Quick Select Presets */}
        <div
          className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2"
          style={{
            maxHeight: '12rem',
            overflowY: 'auto',
            width: '100%', // Ensures the dropdown fits within its container
            boxSizing: 'border-box' // Includes padding and border in the element's width
          }}
        >
          {[{
            label: "Low (<1K)", value: { left: "0", right: "1000" }
          }, {
            label: "Average (1K-10K)", value: { left: "1000", right: "10000" }
          }, {
            label: "Good (10K-50K)", value: { left: "10000", right: "50000" }
          }, {
            label: "Very Good (50K-100K)", value: { left: "50000", right: "100000" }
          }, {
            label: "Excellent (100K-500K)", value: { left: "100000", right: "500000" }
          }, {
            label: "Viral (>500K)", value: { left: "500000", right: "" }
          }].map((range) => (
            <button
              key={range.label}
              onClick={() => onFilterChange({
                reels_plays: {
                  left_number: range.value.left,
                  right_number: range.value.right
                }
              })}
              className={`text-xs p-1.5 rounded border ${
                filters.reels_plays?.left_number === range.value.left &&
                filters.reels_plays?.right_number === range.value.right
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'bg-white border-gray-200 text-gray-700'
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

export default ReelsPlays;
