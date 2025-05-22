import React, { useEffect, useState, useRef } from 'react';
import { IoHeartOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface InterestsProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AVAILABLE_INTERESTS = [
  "Fashion", "Beauty", "Fitness", "Travel", "Food", "Technology",
  "Gaming", "Art", "Music", "Sports", "Movies", "Books",
  "Photography", "Pets", "Home Decor", "Gardening", "Cars",
  "Sustainability", "Finance", "Education"
];

const Interests: React.FC<InterestsProps> = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const [selected, setSelected] = useState<string[]>(filters.interests || []);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(filters.interests || []);
  }, [filters.interests]);

  const handleToggleInterest = (interest: string) => {
    const updated = selected.includes(interest)
      ? selected.filter(i => i !== interest)
      : [...selected, interest];

    setSelected(updated);
    onFilterChange({ interests: updated });
  };

  const filteredInterests = AVAILABLE_INTERESTS.filter(interest =>
    interest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(); // close dropdown
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <FilterComponent
      icon={<IoHeartOutline size={18} />}
      title="Interests"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 relative" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search interests"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={onToggle}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <div className="max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {filteredInterests.length > 0 ? (
              filteredInterests.map((interest) => (
                <label key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-purple-600"
                    checked={selected.includes(interest)}
                    onChange={() => handleToggleInterest(interest)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{interest}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500">No matching interests</p>
            )}
          </div>
        </div>
        {selected.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            {selected.length} interest{selected.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default Interests;
