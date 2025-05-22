import React, { useState, useEffect } from 'react';
import { IoCalendarOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface LastPostProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const LastPost: React.FC<LastPostProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    filters.last_posted || 'any'
  );

  // Sync internal state with parent props
  useEffect(() => {
    if ((filters.last_posted || 'any') !== selectedOption) {
      setSelectedOption(filters.last_posted || 'any');
    }
  }, [filters.last_posted]);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    onFilterChange({ last_posted: value === 'any' ? undefined : value });
  };

  const timeOptions = [
    { value: 'any', label: 'Any' },
    { value: '1_month', label: '1 Month' },
    { value: '3_months', label: '3 Months' },
    { value: '6_months', label: '6 Months' },
  ];

  return (
    <FilterComponent
      icon={<IoCalendarOutline size={18} />}
      title="Last Post"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-600">Influencer</h4>

        <div className="space-y-3">
          {timeOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-3">
              <input
                type="radio"
                name="last_posted"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={() => handleOptionChange(option.value)}
                className="form-radio h-4 w-4 text-purple-600"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </FilterComponent>
  );
};

export default LastPost;
