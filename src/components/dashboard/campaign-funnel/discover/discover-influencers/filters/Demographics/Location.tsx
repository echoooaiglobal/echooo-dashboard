'use client';

import { useState, useEffect } from 'react';
import { IoLocationOutline, IoClose, IoWarningOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { Location, LocationSearchResponse, CreatorLocationSelection } from '@/lib/types';
import { InfluencerSearchFilter, AudienceLocationsFilter } from '@/lib/creator-discovery-types';
import { useFilterClickOutside } from '@/hooks/useClickOutside';

interface LocationFilterProps {
  selectedLocations: CreatorLocationSelection[];
  onSelect: (locations: CreatorLocationSelection[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  onCloseFilter: () => void;
}

export default function LocationFilter({
  selectedLocations,
  onSelect,
  isOpen,
  onToggle,
  searchParams,
  onFilterChange,
  onCloseFilter
}: LocationFilterProps) {
  // Creator locations state
  const [creatorQuery, setCreatorQuery] = useState('');
  const [creatorLocations, setCreatorLocations] = useState<Location[]>([]);
  const [isCreatorLoading, setIsCreatorLoading] = useState(false);
  const [creatorError, setCreatorError] = useState<string | null>(null);
  const [selectedCreatorLocations, setSelectedCreatorLocations] = useState<CreatorLocationSelection[]>([]);

  // Audience locations state
  const [audienceQuery, setAudienceQuery] = useState('');
  const [audienceLocations, setAudienceLocations] = useState<Location[]>([]);
  const [isAudienceLoading, setIsAudienceLoading] = useState(false);
  const [audienceError, setAudienceError] = useState<string | null>(null);
  const [selectedAudienceLocations, setSelectedAudienceLocations] = useState<AudienceLocationsFilter[]>([]);

  // Common state
  const [allFetchedLocations, setAllFetchedLocations] = useState<Location[]>([]);


  // Initialize from searchParams
  useEffect(() => {
    // Initialize creator locations
    if (searchParams.creator_locations && searchParams.creator_locations.length > 0) {
      const creatorLocs = searchParams.creator_locations.map(id => {
        const existing = selectedLocations.find(loc => loc.id === id);
        return existing || {
          id,
          name: `Location ${id}`,
          display_name: undefined,
          type: undefined
        };
      });
      setSelectedCreatorLocations(creatorLocs);
    }

    // Initialize audience locations
    if (searchParams.audience_locations && searchParams.audience_locations.length > 0) {
      setSelectedAudienceLocations(searchParams.audience_locations);
    }
  }, [searchParams.creator_locations, searchParams.audience_locations, selectedLocations]);

  // Generic location fetch function
  const fetchLocations = async (
    query: string,
    setLocations: (locations: Location[]) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ) => {
    if (query.length < 2) {
      setLocations([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams({
        search_string: query.trim(),
        limit: '20',
        offset: '0'
      });

      const response = await fetch(`/api/v0/discover/locations?${searchParams}`);
      const result: LocationSearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || `HTTP ${response.status} error`);
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch locations');
      }

      const fetchedLocations = result.data || [];
      setLocations(fetchedLocations);
      
      // Keep track of all fetched locations for name lookup
      setAllFetchedLocations(prev => {
        const newLocations = fetchedLocations.filter((newLoc: Location) => 
          !prev.some(prevLoc => prevLoc.id === newLoc.id)
        );
        return [...prev, ...newLocations];
      });

    } catch (error) {
      console.error('Error fetching locations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch creator locations
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchLocations(creatorQuery, setCreatorLocations, setIsCreatorLoading, setCreatorError);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [creatorQuery]);

  // Fetch audience locations
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchLocations(audienceQuery, setAudienceLocations, setIsAudienceLoading, setAudienceError);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [audienceQuery]);

  // Creator location handlers
  const toggleCreatorLocation = (location: Location) => {
    const isSelected = selectedCreatorLocations.some(loc => loc.id === location.id);
    
    let updatedSelections: CreatorLocationSelection[];
    
    if (isSelected) {
      updatedSelections = selectedCreatorLocations.filter(loc => loc.id !== location.id);
    } else {
      const newSelection: CreatorLocationSelection = {
        id: location.id,
        name: location.name,
        display_name: location.display_name,
        type: location.type
      };
      updatedSelections = [...selectedCreatorLocations, newSelection];
    }
    
    setSelectedCreatorLocations(updatedSelections);
    onSelect(updatedSelections);
    
    // Update filter
    const creatorLocationIds = updatedSelections.map(loc => loc.id);
    onFilterChange({ creator_locations: creatorLocationIds });
  };

  const removeCreatorLocation = (id: string) => {
    const updatedSelections = selectedCreatorLocations.filter(loc => loc.id !== id);
    setSelectedCreatorLocations(updatedSelections);
    onSelect(updatedSelections);
    
    const creatorLocationIds = updatedSelections.map(loc => loc.id);
    onFilterChange({ creator_locations: creatorLocationIds });
  };

  // Audience location handlers
  const toggleAudienceLocation = (location: Location) => {
    const isSelected = selectedAudienceLocations.some(loc => loc.location_id === location.id);
    
    let updatedSelections: AudienceLocationsFilter[];
    
    if (isSelected) {
      updatedSelections = selectedAudienceLocations.filter(loc => loc.location_id !== location.id);
    } else {
      // Calculate remaining percentage
      const currentTotal = selectedAudienceLocations.reduce((sum, loc) => sum + loc.percentage_value, 0);
      const defaultPercentage = Math.min(20, Math.max(1, 100 - currentTotal));
      
      const newSelection: AudienceLocationsFilter = {
        location_id: location.id,
        percentage_value: defaultPercentage
      };
      updatedSelections = [...selectedAudienceLocations, newSelection];
    }
    
    setSelectedAudienceLocations(updatedSelections);
    onFilterChange({ audience_locations: updatedSelections });
  };

  const removeAudienceLocation = (id: string) => {
    const updatedSelections = selectedAudienceLocations.filter(loc => loc.location_id !== id);
    setSelectedAudienceLocations(updatedSelections);
    onFilterChange({ audience_locations: updatedSelections });
  };

  const updateAudiencePercentage = (id: string, percentage: number) => {
    const validPercentage = Math.min(100, Math.max(1, percentage));
    const updatedSelections = selectedAudienceLocations.map(loc =>
      loc.location_id === id
        ? { ...loc, percentage_value: validPercentage }
        : loc
    );
    setSelectedAudienceLocations(updatedSelections);
    onFilterChange({ audience_locations: updatedSelections });
  };

  // Get location name by ID
  const getLocationNameById = (id: string): string => {
    const location = allFetchedLocations.find(loc => loc.id === id) ||
                   selectedCreatorLocations.find(loc => loc.id === id);
    return location?.display_name || location?.name || `Location ${id}`;
  };

  // Calculate audience total percentage
  const audienceTotalPercentage = selectedAudienceLocations.reduce(
    (sum, loc) => sum + loc.percentage_value, 0
  );

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setCreatorQuery('');
      setAudienceQuery('');
      setCreatorLocations([]);
      setAudienceLocations([]);
      setCreatorError(null);
      setAudienceError(null);
    }
  }, [isOpen]);

  const totalSelectedCount = selectedCreatorLocations.length + selectedAudienceLocations.length;
  const hasActiveFilters = totalSelectedCount > 0 || creatorQuery.length > 0 || audienceQuery.length > 0;
  return (
    <div className="relative z-50">
        <FilterComponent 
          hasActiveFilters={hasActiveFilters}
          icon={<IoLocationOutline size={18} />} 
          title="Location"
          isOpen={isOpen}
          onClose={onCloseFilter}
          onToggle={onToggle}
          className="border border-gray-200 rounded-md"
          selectedCount={totalSelectedCount}
        >
          {/* Empty content to prevent default padding/content */}
          <div className="hidden"></div>
          
          {/* Compact dropdown - positioned to extend right */}
          <div className="absolute left-0 top-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[500px]">
            <div className="flex gap-3 p-3">
              
              {/* Creator Locations Section */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h3 className="text-xs font-semibold text-gray-800">Creator Locations</h3>
                </div>
                
                {/* Creator Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search creator locations..."
                    value={creatorQuery}
                    onChange={(e) => setCreatorQuery(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-400 transition-colors"
                  />
                  {isCreatorLoading && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600"></div>
                    </div>
                  )}
                </div>

                {/* Creator Error Message */}
                {creatorError && (
                  <div className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                    {creatorError}
                  </div>
                )}

                {/* Creator Search Results */}
                <div className="max-h-32 overflow-y-auto">
                  {creatorQuery.length >= 2 && !creatorError && (
                    <div className="space-y-1">
                      {isCreatorLoading ? (
                        <div className="text-xs text-gray-500 px-2 py-1 text-center">
                          Searching...
                        </div>
                      ) : creatorLocations.length > 0 ? (
                        creatorLocations.slice(0, 6).map((location) => (
                          <label 
                            key={location.id} 
                            className="flex items-center p-1.5 hover:bg-purple-50 rounded cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCreatorLocations.some(loc => loc.id === location.id)}
                              onChange={() => toggleCreatorLocation(location)}
                              className="form-checkbox h-3 w-3 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                            />
                            <div className="ml-2 text-xs text-gray-700 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {location.display_name || location.name}
                              </div>
                              {location.type && (
                                <div className="text-xs text-gray-500 capitalize">
                                  {location.type.toLowerCase()}
                                </div>
                              )}
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500 px-2 py-1 text-center">
                          No locations found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Creator Locations */}
                {selectedCreatorLocations.length > 0 && (
                  <div className="border-t border-gray-200 pt-2">
                    <h4 className="text-xs font-medium text-gray-600 mb-1">
                      Selected ({selectedCreatorLocations.length}):
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {selectedCreatorLocations.map((location) => (
                      <span 
                        key={location.id} 
                        className="inline-flex items-center text-xs bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full"
                      >
                        <span className="max-w-28 truncate" title={location.display_name || location.name}>
                          {location.display_name || location.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCreatorLocation(location.id);
                          }}
                          className="ml-1.5 text-purple-600 hover:text-purple-800 flex-shrink-0"
                          title="Remove location"
                        >
                          <IoClose size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  </div>
                )}

                {/* Creator Empty State */}
                {creatorQuery.length === 0 && selectedCreatorLocations.length === 0 && (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <IoLocationOutline className="w-3 h-3 text-purple-600" />
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Search creator locations</div>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="w-px bg-gray-200"></div>

              {/* Audience Locations Section */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-xs font-semibold text-gray-800">Audience Locations</h3>
                </div>
                
                {/* Audience Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search audience locations..."
                    value={audienceQuery}
                    onChange={(e) => setAudienceQuery(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                  />
                  {isAudienceLoading && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Audience Error Message */}
                {audienceError && (
                  <div className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                    {audienceError}
                  </div>
                )}

                {/* Audience Search Results */}
                <div className="max-h-32 overflow-y-auto">
                  {audienceQuery.length >= 2 && !audienceError && (
                    <div className="space-y-1">
                      {isAudienceLoading ? (
                        <div className="text-xs text-gray-500 px-2 py-1 text-center">
                          Searching...
                        </div>
                      ) : audienceLocations.length > 0 ? (
                        audienceLocations.slice(0, 6).map((location) => (
                          <label 
                            key={location.id} 
                            className="flex items-center p-1.5 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedAudienceLocations.some(loc => loc.location_id === location.id)}
                              onChange={() => toggleAudienceLocation(location)}
                              className="form-checkbox h-3 w-3 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <div className="ml-2 text-xs text-gray-700 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {location.display_name || location.name}
                              </div>
                              {location.type && (
                                <div className="text-xs text-gray-500 capitalize">
                                  {location.type.toLowerCase()}
                                </div>
                              )}
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500 px-2 py-1 text-center">
                          No locations found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Audience Locations */}
                {selectedAudienceLocations.length > 0 && (
                  <div className="border-t border-gray-200 pt-2">
                    <h4 className="text-xs font-medium text-gray-600 mb-1">
                      Selected ({selectedAudienceLocations.length}):
                    </h4>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {selectedAudienceLocations.map((audienceLocation) => (
                      <div 
                        key={audienceLocation.location_id} 
                        className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <span className="text-xs text-blue-800 flex-1 truncate font-medium">
                          {getLocationNameById(audienceLocation.location_id)}
                        </span>
                        <div className="flex items-center gap-1 ml-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={audienceLocation.percentage_value}
                            onChange={(e) => updateAudiencePercentage(
                              audienceLocation.location_id, 
                              parseInt(e.target.value) || 1
                            )}
                            className="w-12 text-xs text-center border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                          <span className="text-xs text-blue-600 font-medium">%</span>
                          <button
                            onClick={() => removeAudienceLocation(audienceLocation.location_id)}
                            className="ml-1 text-blue-600 hover:text-blue-800 flex-shrink-0 p-0.5"
                            title="Remove location"
                          >
                            <IoClose size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                )}

                {/* Audience Empty State */}
                {audienceQuery.length === 0 && selectedAudienceLocations.length === 0 && (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <IoLocationOutline className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Search audience locations</div>
                  
                  </div>
                )}
              </div>
            </div>
          </div>
        </FilterComponent>
    </div>
  );
}