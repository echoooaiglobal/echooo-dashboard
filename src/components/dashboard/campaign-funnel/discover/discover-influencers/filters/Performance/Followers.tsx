// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/Followers.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoPersonAddOutline, IoChevronDown, IoClose } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface FollowersFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Predefined follower count options
const FOLLOWER_OPTIONS = [
  { value: 1000, label: '1K' },
  { value: 5000, label: '5K' },
  { value: 10000, label: '10K' },
  { value: 25000, label: '25K' },
  { value: 50000, label: '50K' },
  { value: 100000, label: '100K' },
  { value: 250000, label: '250K' },
  { value: 500000, label: '500K' },
  { value: 1000000, label: '1M' },
  { value: 2500000, label: '2.5M' },
  { value: 5000000, label: '5M' },
  { value: 10000000, label: '10M+' }
];

// Preset ranges for quick selection
const PRESET_RANGES = [
  { label: 'Nano (1K-10K)', min: 1000, max: 10000 },
  { label: 'Micro (10K-100K)', min: 10000, max: 100000 },
  { label: 'Mid-Tier (100K-500K)', min: 100000, max: 500000 },
  { label: 'Macro (500K-1M)', min: 500000, max: 1000000 },
  { label: 'Mega (1M+)', min: 1000000, max: 10000000 }
];

const Followers: React.FC<FollowersFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle
}) => {
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Handle follower count changes
  const handleFollowerChange = (type: 'min' | 'max', value: number) => {
    console.log(`handleFollowerChange: ${type} = ${value}`);
    const currentRange = filters?.follower_count || { min: 1000, max: 1000000 };
    const newRange = {
      ...currentRange,
      [type]: value
    };
    console.log('New range:', newRange);
    onFilterChange({
      follower_count: newRange
    });
  };

  // Handle preset selection
  const handlePresetSelect = (min: number, max: number) => {
    console.log(`handlePresetSelect: min=${min}, max=${max}`);
    onFilterChange({
      follower_count: { min, max }
    });
    // Close any open dropdowns
    setOpenDropdown(null);
  };

  // Clear filter
  const clearFilter = () => {
    console.log('Clearing follower filter');
    onFilterChange({ follower_count: undefined });
    setOpenDropdown(null);
  };

  // Mini dropdown component
  const MiniDropdown: React.FC<{
    id: string;
    value: number;
    options: { value: number; label: string }[];
    onChange: (value: number) => void;
    placeholder: string;
  }> = ({ id, value, options, onChange, placeholder }) => {
    const isDropdownOpen = openDropdown === id;
    const selectedOption = options.find(opt => opt.value === value);

    const handleOptionClick = (optionValue: number) => {
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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
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
                className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                  value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
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

  const hasFilter = filters?.follower_count !== undefined;

  // Get available options based on current selection
  const getMinOptions = () => {
    const maxValue = filters?.follower_count?.max || 10000000;
    return FOLLOWER_OPTIONS.filter(opt => opt.value < maxValue);
  };

  const getMaxOptions = () => {
    const minValue = filters?.follower_count?.min || 1000;
    return FOLLOWER_OPTIONS.filter(opt => opt.value > minValue);
  };

  const hasActiveFilters = hasFilter &&
    (filters.follower_count?.min !== undefined || filters.follower_count?.max !== undefined);
  
  return (
    <div ref={dropdownRef}>
      <FilterComponent
        hasActiveFilters={hasActiveFilters}
        icon={<IoPersonAddOutline size={18} />}
        title="Followers"
        isOpen={isOpen}
        onToggle={onToggle}
        className="border border-gray-200 rounded-md"
      >
        <div className="p-4 space-y-4 w-full">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-800">Follower Count</h3>
            </div>
            {hasFilter && (
              <button
                onClick={clearFilter}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Clear follower filter"
              >
                <IoClose size={16} />
              </button>
            )}
          </div>

          {/* Min/Max Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Minimum</label>
              <MiniDropdown
                id="follower-min"
                value={filters?.follower_count?.min || 1000}
                options={getMinOptions()}
                onChange={(value) => handleFollowerChange('min', value)}
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Maximum</label>
              <MiniDropdown
                id="follower-max"
                value={filters?.follower_count?.max || 1000000}
                options={getMaxOptions()}
                onChange={(value) => handleFollowerChange('max', value)}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Quick Select Presets */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700">Quick Select</h4>
            <div className="grid grid-cols-1 gap-1">
              {PRESET_RANGES.map((range) => {
                const isSelected = filters?.follower_count?.min === range.min && 
                                 filters?.follower_count?.max === range.max;
                
                return (
                  <button
                    key={range.label}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(`Quick select: ${range.label}, min=${range.min}, max=${range.max}`);
                      handlePresetSelect(range.min, range.max);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 border border-blue-300 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="font-medium">{range.label}</div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(range.min)} - {formatNumber(range.max)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {!hasFilter && (
            <div className="text-center py-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <IoPersonAddOutline className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-sm text-gray-600 font-medium">No follower filter applied</div>
              <div className="text-xs text-gray-400 mt-1">Select a range above or use quick presets</div>
            </div>
          )}

        </div>
      </FilterComponent>
    </div>
  );
};

export default Followers;