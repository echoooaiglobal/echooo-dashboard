// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoverFilters.tsx
import React, { useState, useRef, useEffect } from 'react';
import { BsInstagram } from 'react-icons/bs';
import { IoChevronDown } from 'react-icons/io5';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

// Import filter section components
import DemographicsFilters from './filters/Demographics';
import PerformanceFilters from './filters/Performance';
import ContentFilters from './filters/Content';
import AccountFilters from './filters/Account';

type DiscoverFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  onApplyFilters: (appliedFilters: Partial<InfluencerSearchFilter>) => void;
  onClear: () => void;
};

export default function DiscoverFilters({
  searchParams,
  onFilterChange,
  onApplyFilters,
  onClear,
}: DiscoverFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  
  // State to track pending filter changes before applying
  const [pendingFilters, setPendingFilters] = useState<Partial<InfluencerSearchFilter>>({});
  
  // State to track which filter dropdown is open
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setOpenFilterId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle filter changes by updating pending filters
  const handlePendingFilterChange = (updates: Partial<InfluencerSearchFilter>) => {
    setPendingFilters(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Apply all pending filters when button is clicked
  const applyFilters = async () => {
    if (Object.keys(pendingFilters).length > 0) {
      setIsApplying(true);
      try {
        await onApplyFilters(pendingFilters);
        setPendingFilters({});
        setOpenFilterId(null); // Close any open dropdowns
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setIsApplying(false);
      }
    }
  };

  // Clear all filters
  const clearAllFilters = async () => {
    setIsClearing(true);
    try {
      // Clear pending filters but don't modify existing searchParams automatically
      setPendingFilters({});
      setOpenFilterId(null);
      
      // Only call onClear to reset the actual applied filters
      await onClear();
    } catch (error) {
      console.error('Error clearing filters:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = (filterId: string) => {
    setOpenFilterId(prev => prev === filterId ? null : filterId);
  };

  // Check if a filter dropdown is open
  const isFilterOpen = (filterId: string) => {
    return openFilterId === filterId;
  };

  // Combine current searchParams with pending changes for display
  const getDisplayFilters = (): InfluencerSearchFilter => {
    return {
      ...searchParams,
      ...pendingFilters
    };
  };

  const displayFilters = getDisplayFilters();

  // Common style for filter buttons
  const filterButtonStyle = "flex justify-between items-center w-full bg-white text-gray-700 px-4 py-3 rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none";

  // Check if there are any pending changes
  const hasPendingChanges = Object.keys(pendingFilters).length > 0;

  return (
    <div
      className="p-6 bg-white rounded-lg shadow-lg"
      ref={filtersRef}
    >
      <div className="mb-6">
        {/* Header with Instagram selector */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-700">
            Narrow your discovered influencers
          </h2>
          
          {/* Instagram platform selector */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700"
            >
              <BsInstagram className="text-pink-500" size={20} />
              <span>Instagram</span>
              <IoChevronDown className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Demographics Filters */}
        <DemographicsFilters 
          searchParams={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Performance Filters */}
        <PerformanceFilters 
          searchParams={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Content Filters */}
        <ContentFilters 
          searchParams={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Account Filters - Now uses internal toggle management */}
        <AccountFilters 
          searchParams={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Pending Changes Indicator */}
        {/* {hasPendingChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-xs font-medium text-yellow-700 mb-1">
              Pending Changes ({Object.keys(pendingFilters).length}):
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(pendingFilters).map(([key, value]) => (
                <span 
                  key={key}
                  className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
                >
                  {key}: {String(value)}
                </span>
              ))}
            </div>
            <div className="text-xs text-yellow-600 mt-2">
              Click "Apply Filters" to save these changes
            </div>
          </div>
        )} */}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            onClick={clearAllFilters}
            disabled={isClearing || isApplying}
            className={`border border-gray-300 px-8 py-2 rounded-full shadow-sm transition-colors flex items-center gap-2 ${
              isClearing || isApplying
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {isClearing && (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            Clear
          </button>
          <button 
            onClick={applyFilters}
            disabled={!hasPendingChanges || isApplying || isClearing}
            className={`px-8 py-2 rounded-full shadow-md transition-colors flex items-center gap-2 ${
              hasPendingChanges && !isApplying && !isClearing
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isApplying && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Apply Filters {hasPendingChanges && !isApplying && `(${Object.keys(pendingFilters).length})`}
          </button>
        </div>
      </div>
    </div>
  );
}