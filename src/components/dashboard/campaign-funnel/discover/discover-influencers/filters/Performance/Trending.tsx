// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/Trending.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoTrendingUpOutline, IoChevronDown, IoClose } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface TrendingFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
}

// Month options for the dropdown - with clear option as heading
const MONTH_OPTIONS = [
  { value: 0, label: 'Select period', isHeader: true }, // Special clear option
  { value: 1, label: '1 month' },
  { value: 2, label: '2 months' },
  { value: 3, label: '3 months' },
  { value: 4, label: '4 months' },
  { value: 5, label: '5 months' },
  { value: 6, label: '6 months' }
];

const Trending: React.FC<TrendingFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter
}) => {
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Local state for smooth slider (percentage in steps of 5: 5, 10, 15, ..., 100)
  const [localSliderValue, setLocalSliderValue] = useState<number>(
    filters?.follower_growth?.percentage_value || 5
  );
  const [isSliding, setIsSliding] = useState(false);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Trending component - filters changed:', filters);
    console.log('Trending component - follower_growth:', filters?.follower_growth);
  }, [filters]);

  // Sync local slider value with filters when not sliding
  useEffect(() => {
    if (!isSliding && filters?.follower_growth?.percentage_value) {
      setLocalSliderValue(filters.follower_growth.percentage_value);
    }
  }, [filters?.follower_growth?.percentage_value, isSliding]);



  // Close dropdowns when filter closes
  useEffect(() => {
    if (!isOpen) {
      setOpenDropdown(null);
    }
  }, [isOpen]);

  // Handle interval changes
  const handleIntervalChange = (interval: number) => {
    console.log(`handleIntervalChange: ${interval} months`);
    
    // If interval is 0 (Clear Selection), clear the entire filter
    if (interval === 0) {
      console.log('Clearing follower_growth filter via dropdown');
      onFilterChange({ follower_growth: undefined });
      setLocalSliderValue(5);
      setOpenDropdown(null);
      return;
    }

    const currentGrowth = filters?.follower_growth || {
      interval: interval,
      interval_unit: "MONTH",
      operator: "GT",
      percentage_value: localSliderValue
    };

    onFilterChange({
      follower_growth: {
        ...currentGrowth,
        interval,
        interval_unit: "MONTH",
        operator: "GT"
      }
    });
    setOpenDropdown(null);
  };

  // Handle percentage changes (with debouncing for slider)
  const handlePercentageChange = (percentage_value: number) => {
    console.log(`handlePercentageChange: ${percentage_value}%`);
    
    const currentGrowth = filters?.follower_growth || {
      interval: 1,
      interval_unit: "MONTH",
      operator: "GT",
      percentage_value
    };

    onFilterChange({
      follower_growth: {
        ...currentGrowth,
        percentage_value,
        interval_unit: "MONTH",
        operator: "GT"
      }
    });
  };

  // Handle slider input changes (smooth local updates)
  const handleSliderInput = (value: number) => {
    setLocalSliderValue(value);
    setIsSliding(true);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer to update filters after user stops sliding
    debounceTimer.current = setTimeout(() => {
      console.log(`Slider stopped at: ${value}%`);
      handlePercentageChange(value);
      setIsSliding(false);
    }, 300); // 300ms delay after user stops sliding
  };

  // Handle slider mouse up (immediate update)
  const handleSliderMouseUp = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    console.log(`Slider mouse up at: ${localSliderValue}%`);
    handlePercentageChange(localSliderValue);
    setIsSliding(false);
  };

  // Handle preset clicks (immediate update)
  const handlePresetClick = (value: number) => {
    setLocalSliderValue(value);
    setIsSliding(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    handlePercentageChange(value);
  };

  // Clear filter
  const clearFilter = () => {
    console.log('Clearing follower_growth filter');
    onFilterChange({ follower_growth: undefined });
    setLocalSliderValue(5);
    setOpenDropdown(null);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Mini dropdown component
  const MiniDropdown: React.FC<{
    id: string;
    value: number;
    options: { value: number; label: string; isHeader?: boolean }[];
    onChange: (value: number) => void;
    placeholder: string;
  }> = ({ id, value, options, onChange, placeholder }) => {
    const isDropdownOpen = openDropdown === id;
    const selectedOption = options.find(opt => opt.value === value && !opt.isHeader);

    const handleOptionClick = (optionValue: number) => {
      console.log(`MiniDropdown ${id}: selecting value ${optionValue}`);
      onChange(optionValue);
    };

    return (
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`MiniDropdown ${id}: toggle dropdown`);
            setOpenDropdown(isDropdownOpen ? null : id);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <IoChevronDown 
              size={14} 
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionClick(option.value);
                }}
                className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                  value === option.value 
                    ? 'bg-green-50 text-green-700 font-medium hover:bg-green-100' 
                    : 'text-gray-700 hover:bg-green-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const hasFilter = filters?.follower_growth !== undefined;
  const selectedCount = hasFilter ? 1 : 0;
  const hasIntervalSelected = hasFilter && filters?.follower_growth?.interval && filters?.follower_growth?.interval > 0;

  // Convert slider step (1-20) to percentage (5-100)
  const stepToPercentage = (step: number) => step * 5;
  const percentageToStep = (percentage: number) => percentage / 5;
  const hasActiveFilters = hasFilter || localSliderValue > 5;
  
  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoTrendingUpOutline size={18} />}
      title="Trending"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      // selectedCount={selectedCount}
    >
      <div className="p-4 space-y-4 w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-800">Follower Growth</h3>
          </div>
          {hasFilter && (
            <button
              onClick={clearFilter}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="Clear trending filter"
            >
              <IoClose size={16} />
            </button>
          )}
        </div>

        {/* Time Period Dropdown */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Growth Period</label>
            <MiniDropdown
              id="growth-period"
              value={filters?.follower_growth?.interval || 0}
              options={MONTH_OPTIONS}
              onChange={handleIntervalChange}
              placeholder="Select period"
            />
          </div>
        </div>

        {/* Only show percentage slider and divider if interval is selected */}
        {hasIntervalSelected && (
          <>
            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Percentage Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Growth Rate</span>
                <span className="font-medium text-green-600">
                  {'>'}{localSliderValue}%
                </span>
              </div>

              {/* Smooth Custom Slider */}
              <div className="relative px-1">
                <div className="relative">
                  {/* Slider track background */}
                  <div className="w-full h-2 bg-gray-200 rounded-lg relative overflow-hidden">
                    {/* Progress fill */}
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-lg transition-all duration-100 ease-out"
                      style={{
                        width: `${((percentageToStep(localSliderValue) - 1) / 19) * 100}%`
                      }}
                    ></div>
                  </div>
                  
                  {/* Actual slider input (steps 1-20, representing 5%-100%) */}
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={percentageToStep(localSliderValue)}
                    onInput={(e) => handleSliderInput(stepToPercentage(parseInt((e.target as HTMLInputElement).value)))}
                    onMouseUp={handleSliderMouseUp}
                    onTouchEnd={handleSliderMouseUp}
                    className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                  />
                  
                  {/* Custom thumb */}
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-out ${
                      isSliding ? 'scale-110 shadow-xl' : 'hover:scale-110'
                    }`}
                    style={{
                      left: `calc(${((percentageToStep(localSliderValue) - 1) / 19) * 100}% - 10px)`
                    }}
                  ></div>
                </div>
              </div>

              {/* Slider markers */}
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>5%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>

              {/* Quick preset buttons */}
              <div className="grid grid-cols-4 gap-1">
                {[10, 20, 30, 40, 50, 60, 70, 80].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                      localSliderValue === preset
                        ? 'bg-green-100 text-green-700 border border-green-300 font-medium scale-105'
                        : 'text-gray-600 hover:bg-gray-100 border border-gray-200 hover:scale-105'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </FilterComponent>
  );
};

export default Trending;