'use client';

import { useState, useEffect } from 'react';
import { Location } from '@/lib/types';

interface LocationFilterProps {
  type: 'audience' | 'influencer';
  selectedLocations: Array<{ id: number; weight: number }>;
  onSelect: (locations: Array<{ id: number; weight: number }>) => void;
}

export default function LocationFilter({ type, selectedLocations, onSelect }: LocationFilterProps) {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, Location[]>>({});

  useEffect(() => {
    const fetchLocations = async () => {
      if (query.length < 2) {
        setLocations([]);
        return;
      }

      // Check cache first
      if (cache[query]) {
        setLocations(cache[query]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/discover/geolocations?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setCache(prev => ({ ...prev, [query]: data }));
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, cache]);

  const handleAddLocation = (location: Location) => {
    if (selectedLocations.some(loc => loc.id === location.id)) return;
    
    const newLocation = { 
      id: location.id, 
      weight: type === 'audience' ? 0.3 : 1 // Default weights
    };
    onSelect([...selectedLocations, newLocation]);
    setQuery('');
    setLocations([]);
  };

  const handleRemoveLocation = (id: number) => {
    onSelect(selectedLocations.filter(loc => loc.id !== id));
  };

  const handleWeightChange = (id: number, weight: number) => {
    onSelect(selectedLocations.map(loc => 
      loc.id === id ? { ...loc, weight } : loc
    ));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder={`Add city or country (${type})`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
      </div>

      {isLoading && <div className="text-sm text-gray-500">Loading...</div>}

      {locations.length > 0 && (
        <ul className="border rounded divide-y max-h-40 overflow-y-auto">
          {locations.map(location => (
            <li key={location.id} className="p-2 hover:bg-gray-50 cursor-pointer">
              <button 
                type="button" 
                onClick={() => handleAddLocation(location)}
                className="w-full text-left"
              >
                {location.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedLocations.length > 0 && (
        <div className="space-y-2 mt-2">
          {selectedLocations.map(({ id, weight }) => {
            const location = [...locations].find(loc => loc.id === id);
            const displayName = location?.name || `Location ${id}`;
            
            return (
              <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{displayName}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={weight}
                    onChange={(e) => handleWeightChange(id, parseFloat(e.target.value))}
                    className="w-16 p-1 border rounded text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}