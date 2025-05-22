import React from 'react';
import { DiscoverSearchParams } from '@/lib/types';
import LocationFilter from './filters/LocationFilter';

type DiscoverFiltersProps = {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  onClear: () => void;
};

export default function DiscoverFilters({ filters, onFilterChange, onClear }: DiscoverFiltersProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ text: e.target.value });
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      gender: {
        code: e.target.value,
        weight: e.target.value ? 0.3 : 0
      }
    });
  };
 
  const handleFollowersChange = (type: 'left_number' | 'right_number', value: string) => {
    onFilterChange({
      followers: {
        ...filters.followers,
        [type]: value
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Narrow your discovered influencers...</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium mb-2">Demographics</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Audience</h4>
              <LocationFilter
                type="audience"
                selectedLocations={filters.audience_geo}
                onSelect={(locations) => onFilterChange({ audience_geo: locations })}
              />
            </div>
            
            {/* Influencer Location */}
            <div>
              <h4 className="text-sm font-medium mb-1">Influencer</h4>
              <LocationFilter
                type="influencer"
                selectedLocations={filters.geo}
                onSelect={(locations) => onFilterChange({ geo: locations })}
              />
            </div>


            <div>
              <h4 className="text-sm font-medium mb-1">Gender</h4>
              <select
                value={filters.gender.code}
                onChange={handleGenderChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Any</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Performance</h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium mb-1">Followers</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Min"
                  value={filters.followers.left_number}
                  onChange={(e) => handleFollowersChange('left_number', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Max"
                  value={filters.followers.right_number}
                  onChange={(e) => handleFollowersChange('right_number', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Content</h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium mb-1">Keywords</h4>
              <input
                type="text"
                value={filters.text}
                onChange={handleTextChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. fashion, beauty"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t mt-4">
        <div className="text-sm text-gray-600">
          <strong>Filters:</strong>
          {filters.audience_geo.map(loc => (
            <span key={`aud-${loc.id}`} className="ml-2">
              Location Aud: {loc.country || loc.id} &gt; {loc.weight * 100}%
            </span>
          ))}
          {filters.geo.map(loc => (
            <span key={`inf-${loc.id}`} className="ml-2">
              Location Inf: {loc.city || loc.country || loc.id}
            </span>
          ))}
          {filters.gender.code && `Gender: ${filters.gender.code}`}
        </div>
        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}