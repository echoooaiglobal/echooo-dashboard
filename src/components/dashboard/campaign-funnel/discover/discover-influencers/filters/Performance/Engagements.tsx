// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/Engagements.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoHeartOutline, IoChevronDown, IoClose } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, NumericRange, EngagementRate } from '@/lib/creator-discovery-types';

interface EngagementsFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
}

// Predefined engagement count options
const ENGAGEMENT_OPTIONS = [
  { value: 100, label: '100' },
  { value: 500, label: '500' },
  { value: 1000, label: '1K' },
  { value: 2500, label: '2.5K' },
  { value: 5000, label: '5K' },
  { value: 10000, label: '10K' },
  { value: 25000, label: '25K' },
  { value: 50000, label: '50K' },
  { value: 100000, label: '100K' },
  { value: 250000, label: '250K' },
  { value: 500000, label: '500K' },
  { value: 1000000, label: '1M+' }
];

// Predefined engagement rate percentages (1 to 100)
const ENGAGEMENT_RATE_OPTIONS = [
  { value: "1", label: '>1%' },
  { value: "2", label: '>2%' },
  { value: "3", label: '>3%' },
  { value: "4", label: '>4%' },
  { value: "5", label: '>5%' },
  { value: "6", label: '>6%' },
  { value: "7", label: '>7%' },
  { value: "8", label: '>8%' },
  { value: "9", label: '>9%' },
  { value: "10", label: '>10%' },
  { value: "15", label: '>15%' },
  { value: "20", label: '>20%' },
  { value: "25", label: '>25%' },
  { value: "30", label: '>30%' }
];

const Engagements: React.FC<EngagementsFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter
}) => {
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Local state for smooth slider
  const [localSliderValue, setLocalSliderValue] = useState<string>(
    filters?.engagement_rate?.percentage_value || "1"
  );
  const [isSliding, setIsSliding] = useState(false);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Engagements component - filters changed:', filters);
    console.log('Engagements component - total_engagements:', filters?.total_engagements);
    console.log('Engagements component - engagement_rate:', filters?.engagement_rate);
  }, [filters]);

  // Sync local slider value with filters when not sliding
  useEffect(() => {
    if (!isSliding && filters?.engagement_rate?.percentage_value) {
      setLocalSliderValue(filters.engagement_rate.percentage_value);
    }
  }, [filters?.engagement_rate?.percentage_value, isSliding]);

  // Close dropdowns when filter closes
  useEffect(() => {
    if (!isOpen) {
      setOpenDropdown(null);
    }
  }, [isOpen]);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return num.toString();
  };

  // Handle total engagements changes
  const handleTotalEngagementsChange = (type: 'min' | 'max', value: number) => {
    console.log(`handleTotalEngagementsChange: ${type} = ${value}`);
    const currentRange = filters?.total_engagements || { min: 100, max: 100000 };
    const newRange = {
      ...currentRange,
      [type]: value
    };
    console.log('New total_engagements range:', newRange);
    
    onFilterChange({
      total_engagements: newRange
    });
  };

  // Handle engagement rate changes with debouncing
  const handleEngagementRateChange = (percentage_value: string) => {
    console.log(`handleEngagementRateChange: ${percentage_value}%`);
    
    onFilterChange({
      engagement_rate: {
        percentage_value
      }
    });
  };

  // Handle slider input changes (smooth local updates)
  const handleSliderInput = (value: string) => {
    setLocalSliderValue(value);
    setIsSliding(true);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer to update filters after user stops sliding
    debounceTimer.current = setTimeout(() => {
      console.log(`Slider stopped at: ${value}%`);
      handleEngagementRateChange(value);
      setIsSliding(false);
    }, 300); // 300ms delay after user stops sliding
  };

  // Handle slider mouse up (immediate update)
  const handleSliderMouseUp = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    console.log(`Slider mouse up at: ${localSliderValue}%`);
    handleEngagementRateChange(localSliderValue);
    setIsSliding(false);
  };

  // Handle preset clicks (immediate update)
  const handlePresetClick = (value: string) => {
    setLocalSliderValue(value);
    setIsSliding(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    handleEngagementRateChange(value);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Clear filters
  const clearTotalEngagements = () => {
    console.log('Clearing total_engagements filter');
    onFilterChange({ total_engagements: undefined });
    setOpenDropdown(null);
  };

  const clearEngagementRate = () => {
    console.log('Clearing engagement_rate filter');
    onFilterChange({ engagement_rate: undefined });
    setOpenDropdown(null);
  };

  // Mini dropdown component
  const MiniDropdown: React.FC<{
    id: string;
    value: number | string;
    options: { value: number | string; label: string }[];
    onChange: (value: number | string) => void;
    placeholder: string;
  }> = ({ id, value, options, onChange, placeholder }) => {
    const isDropdownOpen = openDropdown === id;
    const selectedOption = options.find(opt => opt.value === value);

    const handleOptionClick = (optionValue: number | string) => {
      console.log(`MiniDropdown ${id}: selecting value ${optionValue}`);
      onChange(optionValue);
      setOpenDropdown(null);
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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors"
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
                className={`w-full px-3 py-2 text-sm text-left hover:bg-purple-50 transition-colors ${
                  value === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
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

  const hasTotalEngagements = filters?.total_engagements !== undefined;
  const hasEngagementRate = filters?.engagement_rate !== undefined;
  const selectedCount = (hasTotalEngagements ? 1 : 0) + (hasEngagementRate ? 1 : 0);

  // Get available options based on current selection
  const getMinOptions = () => {
    const maxValue = filters?.total_engagements?.max || 1000000;
    return ENGAGEMENT_OPTIONS.filter(opt => (opt.value as number) < maxValue);
  };

  const getMaxOptions = () => {
    const minValue = filters?.total_engagements?.min || 100;
    return ENGAGEMENT_OPTIONS.filter(opt => (opt.value as number) > minValue);
  };

  const hasActiveFilters = hasTotalEngagements || hasEngagementRate;
  
  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoHeartOutline size={18} />}
      title="Engagements"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount={selectedCount}
    >
      <div className="p-4 space-y-4 w-full">
        
        {/* Total Engagements Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-800">Total Engagements</h4>
            </div>
            {hasTotalEngagements && (
              <button
                onClick={clearTotalEngagements}
                className="text-purple-600 hover:text-purple-800 transition-colors"
                title="Clear total engagements filter"
              >
                <IoClose size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Minimum</label>
              <MiniDropdown
                id="engagements-min"
                value={filters?.total_engagements?.min || 100}
                options={getMinOptions()}
                onChange={(value) => handleTotalEngagementsChange('min', value as number)}
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Maximum</label>
              <MiniDropdown
                id="engagements-max"
                value={filters?.total_engagements?.max || 100000}
                options={getMaxOptions()}
                onChange={(value) => handleTotalEngagementsChange('max', value as number)}
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Engagement Rate Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-800">Engagement Rate</h4>
            </div>
            {hasEngagementRate && (
              <button
                onClick={clearEngagementRate}
                className="text-pink-600 hover:text-pink-800 transition-colors"
                title="Clear engagement rate filter"
              >
                <IoClose size={16} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Minimum Rate</span>
              <span className="font-medium text-pink-600">
                {localSliderValue}%
              </span>
            </div>

            {/* Smooth Custom Slider */}
            <div className="relative px-1">
              <div className="relative">
                {/* Slider track background */}
                <div className="w-full h-2 bg-gray-200 rounded-lg relative overflow-hidden">
                  {/* Progress fill */}
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg transition-all duration-100 ease-out"
                    style={{
                      width: `${((parseInt(localSliderValue) - 1) / 99) * 100}%`
                    }}
                  ></div>
                </div>
                
                {/* Actual slider input */}
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={localSliderValue}
                  onInput={(e) => handleSliderInput((e.target as HTMLInputElement).value)}
                  onMouseUp={handleSliderMouseUp}
                  onTouchEnd={handleSliderMouseUp}
                  className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                />
                
                {/* Custom thumb */}
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-pink-500 border-2 border-white rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-out ${
                    isSliding ? 'scale-110 shadow-xl' : 'hover:scale-110'
                  }`}
                  style={{
                    left: `calc(${((parseInt(localSliderValue) - 1) / 99) * 100}% - 10px)`
                  }}
                ></div>
              </div>
            </div>

            {/* Slider markers */}
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>1%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex gap-1">
              {[5, 10, 15, 20, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset.toString())}
                  className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                    localSliderValue === preset.toString()
                      ? 'bg-pink-100 text-pink-700 border border-pink-300 font-medium scale-105'
                      : 'text-gray-600 hover:bg-gray-100 border border-gray-200 hover:scale-105'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </FilterComponent>
  );
};

export default Engagements;