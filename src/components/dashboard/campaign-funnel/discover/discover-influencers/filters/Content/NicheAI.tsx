import React, { useState, useEffect } from 'react';
import { IoGridOutline } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface NicheAIProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const NicheAI: React.FC<NicheAIProps> = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>(filters.niches || []);
  const [suggestedNiches, setSuggestedNiches] = useState<string[]>([]);

  // Initialize with existing filters - but only when filters.niches truly changes
  useEffect(() => {
    if (filters.niches) {
      const areArraysDifferent =
        filters.niches.length !== selectedNiches.length ||
        filters.niches.some(niche => !selectedNiches.includes(niche));

      if (areArraysDifferent) {
        setSelectedNiches(filters.niches);
      }
    }
  }, [filters.niches]); // Only depend on filters.niches, not selectedNiches

  // Popular niches list - moved outside of useEffect to prevent unnecessary recreations
  const popularNiches = [
    "Fashion", "Beauty", "Fitness", "Food", "Travel", 
    "Lifestyle", "Technology", "Gaming", "Business",
    "Education", "Health", "Parenting", "Art", "Music",
    "Sports", "Comedy", "DIY", "Photography"
  ];

  // Update suggested niches based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = popularNiches.filter(niche =>
        niche.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestedNiches(filtered);
    } else {
      setSuggestedNiches(popularNiches);
    }
  }, [searchQuery]); // This dependency is fine as it only changes on user input

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleNicheSelect = (niche: string) => {
    if (!selectedNiches.includes(niche)) {
      const newNiches = [...selectedNiches, niche];
      setSelectedNiches(newNiches);
      onFilterChange({ niches: newNiches });
    }
    setSearchQuery(''); // Clear search after selection
  };

  const handleRemoveNiche = (nicheToRemove: string) => {
    const newNiches = selectedNiches.filter(niche => niche !== nicheToRemove);
    setSelectedNiches(newNiches);
    onFilterChange({ niches: newNiches });
  };

  return (
    <FilterComponent 
      icon={<div className="flex items-center"><IoGridOutline size={16} /><FaRobot size={10} className="ml-1" /></div>} 
      title="Niche AI"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-600 mb-1">
          Write the influencer's main interest in 1-2 words
        </h4>
        <input
          type="text"
          placeholder="Foodie"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
        />

        {/* Suggested niches dropdown */}
        {searchQuery && (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md mt-1">
            {suggestedNiches.map((niche) => (
              <div
                key={niche}
                className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                onClick={() => handleNicheSelect(niche)}
              >
                {niche}
              </div>
            ))}
          </div>
        )}

        {/* Selected niches */}
        {selectedNiches.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {selectedNiches.map((niche) => (
                <div
                  key={niche}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {niche}
                  <button
                    className="ml-2 text-purple-600 hover:text-purple-900"
                    onClick={() => handleRemoveNiche(niche)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default NicheAI;
