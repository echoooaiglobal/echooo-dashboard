'use client';

import { useState, useEffect, useRef } from 'react';
import { IoLocationOutline, IoClose } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { Location } from '@/lib/types';

interface LocationFilterProps {
  selectedLocations: Array<{ id: number; weight: number }>;
  onSelect: (locations: Array<{ id: number; weight: number }>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function LocationFilter({
  selectedLocations,
  onSelect,
  isOpen,
  onToggle
}: LocationFilterProps) {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterComponentRef = useRef<HTMLDivElement>(null);

  const [allFetchedLocations, setAllFetchedLocations] = useState<Location[]>([]);

  // Close dropdown when clicking outside (delegated to parent already)
  // No need to handle isOpen here

  // Fetch locations
  useEffect(() => {
    if (query.length < 2) {
      setLocations([]);
      return;
    }

    const fetchLocations = async () => {
      const response = await fetch(`/api/discover/geolocations?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setLocations(data);
      setAllFetchedLocations(prev => {
        const newLocations = data.filter((newLoc: Location) => 
          !prev.some(prevLoc => prevLoc.id === newLoc.id)
        );
        return [...prev, ...newLocations];
      });
    };

    const debounceTimer = setTimeout(fetchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const toggleLocation = (location: Location) => {
    const isSelected = selectedLocations.some(loc => loc.id === location.id);
    
    if (isSelected) {
      onSelect(selectedLocations.filter(loc => loc.id !== location.id));
    } else {
      onSelect([
        ...selectedLocations,
        { id: location.id, weight: 1 }
      ]);
    }
  };

  const removeLocation = (id: number) => {
    onSelect(selectedLocations.filter(loc => loc.id !== id));
  };

  const getNameById = (id: number) => {
    const location = allFetchedLocations.find(loc => loc.id === id);
    return location?.name || `Location ${id}`;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div ref={filterComponentRef}>
        <FilterComponent 
          icon={<IoLocationOutline size={18} />} 
          title="Location"
          isOpen={isOpen}
          onToggle={onToggle}
          className="border border-gray-200 rounded-md"
        >
          <div className="space-y-3 p-3">
            <input
              type="text"
              placeholder="Search Location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />

            <div className="max-h-48 overflow-y-auto space-y-2">
              {locations.length > 0 ? (
                locations.map((location) => (
                  <label key={location.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLocations.some(loc => loc.id === location.id)}
                      onChange={() => toggleLocation(location)}
                      className="form-checkbox h-4 w-4 text-purple-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{location.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 px-2">
                  {query.length < 2 ? 'Type at least 2 characters' : 'No locations found'}
                </p>
              )}
            </div>

            {selectedLocations.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <h4 className="text-xs font-medium text-gray-500 mb-1">Selected Locations:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedLocations.map(({ id }) => (
                    <span 
                      key={id} 
                      className="flex items-center text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                    >
                      {getNameById(id)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocation(id);
                        }}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <IoClose size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FilterComponent>
      </div>
    </div>
  );
}
