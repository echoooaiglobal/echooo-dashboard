// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/ReelsPlays.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoPlayOutline, IoClose, IoChevronDown } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, ReelViewsFilter } from '@/lib/creator-discovery-types';

interface ReelsPlaysProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
}

const ReelsPlays: React.FC<ReelsPlaysProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter
}) => {
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Predefined reel views options
  const REEL_VIEWS_OPTIONS = [
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1K' },
    { value: 2000, label: '2K' },
    { value: 5000, label: '5K' },
    { value: 10000, label: '10K' },
    { value: 20000, label: '20K' },
    { value: 50000, label: '50K' },
    { value: 100000, label: '100K' },
    { value: 200000, label: '200K' },
    { value: 500000, label: '500K' },
    { value: 1000000, label: '1M' },
    { value: 2000000, label: '2M' },
    { value: 5000000, label: '5M' },
    { value: 10000000, label: '10M' }
  ];

  // Close dropdowns when filter closes
  useEffect(() => {
    if (!isOpen) {
      setOpenDropdown(null);
    }
  }, [isOpen]);

  // Handle min/max changes
  const handleReelViewsChange = (type: 'min' | 'max', value: number | null) => {
    console.log(`handleReelViewsChange: ${type} = ${value}`);
    
    const currentReelViews = filters?.instagram_options?.reel_views;
    
    // If clearing a value and only one exists, clear the entire filter
    if (value === null) {
      if (type === 'min' && currentReelViews?.max === undefined) {
        // Clearing min and no max exists, clear entire filter
        clearFilter();
        return;
      }
      if (type === 'max' && currentReelViews?.min === undefined) {
        // Clearing max and no min exists, clear entire filter
        clearFilter();
        return;
      }
    }

    // Create the new filter object
    let newReelViews: ReelViewsFilter | undefined;

    if (type === 'min') {
      if (value !== null) {
        // Setting min value
        newReelViews = {
          min: value,
          max: currentReelViews?.max || 10000000 // Default high value if no max
        };
      } else {
        // Clearing min value, keep max only
        if (currentReelViews?.max !== undefined) {
          newReelViews = {
            min: 0, // Default to 0 when only max is set
            max: currentReelViews.max
          };
        }
      }
    } else {
      // type === 'max'
      if (value !== null) {
        // Setting max value
        newReelViews = {
          min: currentReelViews?.min || 0, // Default to 0 if no min
          max: value
        };
      } else {
        // Clearing max value (setting to "No Limit"), keep min only
        if (currentReelViews?.min !== undefined) {
          newReelViews = {
            min: currentReelViews.min,
            max: 10000000 // Use high value for "no limit"
          };
        }
      }
    }

    console.log('New reel views:', newReelViews);

    onFilterChange({
      instagram_options: {
        ...filters?.instagram_options,
        reel_views: newReelViews
      }
    });
    
    setOpenDropdown(null);
  };

  // Handle preset selection
  const handlePresetSelect = (min?: number, max?: number) => {
    console.log(`handlePresetSelect: min=${min}, max=${max}`);
    
    const reelViews: ReelViewsFilter = {
      min: min !== undefined ? min : 0,
      max: max !== undefined ? max : 10000000 // Use 10M for unlimited
    };

    onFilterChange({
      instagram_options: {
        ...filters?.instagram_options,
        reel_views: reelViews
      }
    });
    setOpenDropdown(null);
  };

  // Clear filter
  const clearFilter = () => {
    console.log('Clearing reel views filter');
    onFilterChange({
      instagram_options: {
        ...filters?.instagram_options,
        reel_views: undefined
      }
    });
    setOpenDropdown(null);
  };

  const hasFilter = filters?.instagram_options?.reel_views !== undefined;
  const selectedCount = hasFilter ? 1 : 0;
  const currentReelViews = filters?.instagram_options?.reel_views;

  // Get available options based on current selection
  const getMinOptions = () => {
    const maxValue = currentReelViews?.max;
    if (maxValue === undefined) {
      return REEL_VIEWS_OPTIONS; // If no max selected, all options available
    }
    return REEL_VIEWS_OPTIONS.filter(opt => opt.value < maxValue);
  };

  const getMaxOptions = () => {
    const minValue = currentReelViews?.min;
    const options = minValue 
      ? REEL_VIEWS_OPTIONS.filter(opt => opt.value > minValue)
      : REEL_VIEWS_OPTIONS;
    
    // Add "No Limit" option for max
    return [
      { value: 10000000, label: 'No Limit', isSpecial: true },
      ...options.filter(opt => opt.value < 10000000) // Don't duplicate 10M
    ];
  };

  // Preset ranges
  const presetRanges = [
    { label: "Low (<1K)", min: 0, max: 1000 },
    { label: "Average (1K-10K)", min: 1000, max: 10000 },
    { label: "Good (10K-50K)", min: 10000, max: 50000 },
    { label: "Very Good (50K-100K)", min: 50000, max: 100000 },
    { label: "Excellent (100K-500K)", min: 100000, max: 500000 },
    { label: "Viral (>500K)", min: 500000, max: undefined }
  ];

  // Check if current filter matches a preset
  const isPresetSelected = (presetMin?: number, presetMax?: number) => {
    return currentReelViews?.min === presetMin && currentReelViews?.max === presetMax;
  };

  // Mini dropdown component
  const MiniDropdown: React.FC<{
    id: string;
    value: number | undefined;
    options: { value: number; label: string; isSpecial?: boolean }[];
    onChange: (value: number) => void;
    placeholder: string;
  }> = ({ id, value, options, onChange, placeholder }) => {
    const isDropdownOpen = openDropdown === id;
    const selectedOption = options.find(opt => opt.value === value);

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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption ? 
                (selectedOption.value === 10000000 && selectedOption.isSpecial ? 'No Limit' : selectedOption.label) 
                : placeholder
              }
            </span>
            <IoChevronDown 
              size={14} 
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionClick(option.value);
                }}
                className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                  option.isSpecial
                    ? 'bg-gray-50 text-blue-600 hover:bg-blue-50 border-b border-gray-200 font-medium'
                    : value === option.value 
                      ? 'bg-purple-50 text-purple-700 font-medium hover:bg-purple-100' 
                      : 'text-gray-700 hover:bg-purple-50'
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

  const hasActiveFilters = Object.keys(filters?.instagram_options || {}).length > 0;

  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoPlayOutline size={18} />}
      title="Reels Plays"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount={0}
    >
      <div className="p-4 space-y-4 w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-800">Average Reel Views</h3>
          </div>
          {hasFilter && (
            <button
              onClick={clearFilter}
              className="text-purple-600 hover:text-purple-800 transition-colors"
              title="Clear reels plays filter"
            >
              <IoClose size={16} />
            </button>
          )}
        </div>

        {/* Select Fields */}
        <div className="grid grid-cols-2 gap-3">
          {/* Min Field */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Minimum</label>
            <MiniDropdown
              id="min-views"
              value={currentReelViews?.min}
              options={getMinOptions()}
              onChange={(value) => handleReelViewsChange('min', value)}
              placeholder="Select minimum"
            />
          </div>

          {/* Max Field */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Maximum</label>
            <MiniDropdown
              id="max-views"
              value={currentReelViews?.max}
              options={getMaxOptions()}
              onChange={(value) => handleReelViewsChange('max', value)}
              placeholder="Select maximum"
            />
          </div>
        </div>

        {/* Divider */}
        {/* <div className="border-t border-gray-200"></div> */}

        {/* Quick Select Presets */}
        {/* <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Quick Select Ranges</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {presetRanges.map((range, index) => (
              <button
                key={index}
                onClick={() => handlePresetSelect(range.min, range.max)}
                className={`px-3 py-2 text-xs rounded-md border transition-all duration-200 ${
                  isPresetSelected(range.min, range.max)
                    ? 'bg-purple-100 border-purple-300 text-purple-700 font-medium'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div> */}
      </div>
    </FilterComponent>
  );
};

export default ReelsPlays;