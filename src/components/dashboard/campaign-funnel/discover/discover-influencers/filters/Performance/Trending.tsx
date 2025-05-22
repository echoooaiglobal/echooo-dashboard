import React, { useState } from 'react';
import { IoTrendingUpOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface TrendingFilterProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Trending: React.FC<TrendingFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle
}) => {
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);

  const monthOptions = [1, 2, 3, 4, 5, 6];
  const percentageOptions = [1, 5, 10, 15, 20];

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const months = parseInt(e.target.value) || null;
    setSelectedMonths(months);
    setSelectedPercentage(null); // Reset percentage when months change
    
    // Update filters immediately if percentage was already selected
    if (selectedPercentage) {
      updateTrendingFilter(months, selectedPercentage);
    }
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const percentage = parseInt(e.target.value) || null;
    setSelectedPercentage(percentage);
    
    // Only update filters if months are already selected
    if (selectedMonths) {
      updateTrendingFilter(selectedMonths, percentage);
    }
  };

  const updateTrendingFilter = (months: number | null, percentage: number | null) => {
    if (months && percentage) {
      onFilterChange({
        followers: {
          ...filters.followers,
          growth_period: `${months} months`,
          growth_rate: `>${percentage}%`
        }
      });
    } else {
      // Clear the filter if either value is missing
      const { growth_period, growth_rate, ...rest } = filters.followers || {};
      onFilterChange({
        followers: rest
      });
    }
  };

  return (
    <FilterComponent
      icon={<IoTrendingUpOutline size={18} />}
      title="Trending"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4 p-3">
        {/* Followers Growth Period */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Followers Growth Period</h4>
          <select
            value={selectedMonths || ''}
            onChange={handleMonthChange}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">Choose interval</option>
            {monthOptions.map((months) => (
              <option key={months} value={months}>
                {months} month{months !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Percentage Threshold (only shown when months are selected) */}
        {selectedMonths && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Select Percentage</h4>
            <select
              value={selectedPercentage || ''}
              onChange={handlePercentageChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Select growth percentage</option>
              {percentageOptions.map((percent) => (
                <option key={percent} value={percent}>
                  &gt;{percent}% growth
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Filter Display */}
        {filters.followers?.growth_period && filters.followers?.growth_rate && (
          <div className="text-xs text-purple-600 mt-2">
            Current filter: {filters.followers.growth_period} with {filters.followers.growth_rate} growth
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default Trending;
