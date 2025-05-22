import React, { useState, useRef, useEffect } from 'react';
import { BsInstagram } from 'react-icons/bs';
import { IoChevronDown } from 'react-icons/io5';
import { DiscoverSearchParams } from '@/lib/types';

// Import filter section components
import DemographicsFilters from './filters/Demographics';
import PerformanceFilters from './filters/Performance';
import ContentFilters from './filters/Content';
import AccountFilters from './filters/Account';

type DiscoverFiltersProps = {
  filters: DiscoverSearchParams['filter'];
  audience_source: DiscoverSearchParams['audience_source'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  onClear: () => void;
};

export default function InfluencerFilters({
  filters,
  onFilterChange,
  onClear,
}: DiscoverFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [onlyCredible, setOnlyCredible] = useState<boolean>(false);
  const [excludePrivate, setExcludePrivate] = useState<boolean>(false);
  
  // State to track pending filter changes before applying
  const [pendingFilters, setPendingFilters] = useState<Partial<DiscoverSearchParams['filter']>>({});
  
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
  const handlePendingFilterChange = (updates: Partial<DiscoverSearchParams['filter']>) => {
    setPendingFilters(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Apply all pending filters when button is clicked
  const applyFilters = () => {
    if (Object.keys(pendingFilters).length > 0) {
      onFilterChange(pendingFilters);
      setPendingFilters({});
    }
    setOpenFilterId(null); // Close any open dropdowns
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = (filterId: string) => {
    setOpenFilterId(prev => prev === filterId ? null : filterId);
  };

  // Check if a filter dropdown is open
  const isFilterOpen = (filterId: string) => {
    return openFilterId === filterId;
  };

  // Combine current filters with pending changes for display
  const getDisplayFilters = () => {
    return {
      ...filters,
      ...pendingFilters
    };
  };

  const displayFilters = getDisplayFilters();

  // Common style for filter buttons
  const filterButtonStyle = "flex justify-between items-center w-full bg-white text-gray-700 px-4 py-3 rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none";

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
          filters={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Performance Filters */}
        <PerformanceFilters 
          filters={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Content Filters */}
        <ContentFilters 
          filters={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
        />

        {/* Account Filters */}
        <AccountFilters 
          filters={displayFilters}
          onFilterChange={handlePendingFilterChange}
          filterButtonStyle={filterButtonStyle}
          openFilterId={openFilterId}
          toggleFilterDropdown={toggleFilterDropdown}
          isFilterOpen={isFilterOpen}
          onlyVerified={onlyVerified}
          setOnlyVerified={setOnlyVerified}
          onlyCredible={onlyCredible}
          setOnlyCredible={setOnlyCredible}
          excludePrivate={excludePrivate}
          setExcludePrivate={setExcludePrivate}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => {
              setPendingFilters({});
              onClear();
              setOpenFilterId(null);
              setOnlyVerified(false);
              setOnlyCredible(false);
              setExcludePrivate(false);
            }}
            className="border border-gray-300 text-gray-500 px-8 py-2 rounded-full hover:bg-gray-100 shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={applyFilters}
            className="bg-purple-600 text-white px-8 py-2 rounded-full hover:bg-purple-700 shadow-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}