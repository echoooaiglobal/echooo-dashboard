// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/FilterComponent.tsx
import React from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';

interface FilterComponentProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  isOpen?: boolean;
  onToggle: () => void;
  className: string;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  selectedCount?: number;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  icon,
  title,
  children,
  isOpen = false,
  onToggle,
  className,
  hasActiveFilters = false,
  isLoading = false,
  selectedCount = 0
}) => {
  // Determine if filter is active
  const isActive = hasActiveFilters;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 ${
          isActive
            ? 'border-purple-300 bg-purple-50 text-purple-700'
            : 'border-gray-300 text-gray-600 hover:border-purple-300'
        } ${isLoading ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
      >
        <div className="flex items-center">
          <span className={`mr-2 transition-colors duration-200 ${
            isActive ? 'text-purple-600' : 'text-gray-400'
          }`}>
            {icon}
          </span>
          <div className="flex flex-col items-start">
            <span className={`text-sm font-medium ${
              isActive ? 'text-purple-700' : 'text-gray-600'
            }`}>
              {title}
            </span>
            
            {/* Loading Indicator Only */}
            {isLoading && (
              <div className="flex items-center gap-1 mt-0.5">
                <div className="animate-spin rounded-full h-2.5 w-2.5 border border-purple-600 border-t-transparent"></div>
                <span className="text-xs text-purple-600">Loading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selected Count Badge */}
          {isActive && selectedCount > 0 && !isLoading && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-purple-500 text-white text-xs font-medium rounded-full">
              {selectedCount}
            </span>
          )}
          
          {/* Active Indicator Dot (when no count or count is 0) */}
          {isActive && selectedCount === 0 && !isLoading && (
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          )}
          
          {/* Loading Spinner (if loading) */}
          {isLoading && (
            <div className="animate-spin rounded-full h-3 w-3 border border-purple-600 border-t-transparent"></div>
          )}
          
          {/* Chevron */}
          <IoChevronDownOutline 
            className={`transition-all duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            } ${isActive ? 'text-purple-600' : 'text-gray-400'}`} 
          />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterComponent;