// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/Hashtags.tsx
import React, { useState, useEffect, useRef } from 'react';
import { IoDocumentTextOutline, IoClose } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, HashtagFilter } from '@/lib/creator-discovery-types';

interface HashtagsFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Hashtags: React.FC<HashtagsFilterProps> = ({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onToggle 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<HashtagFilter[]>(
    filters.hashtags || []
  );
  
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize with existing filters
  useEffect(() => {
    if (filters.hashtags) {
      const areArraysDifferent =
        filters.hashtags.length !== selectedHashtags.length ||
        filters.hashtags.some(hashtag => 
          !selectedHashtags.find(selected => selected.name === hashtag.name)
        );

      if (areArraysDifferent) {
        setSelectedHashtags(filters.hashtags);
      }
    }
  }, [filters.hashtags]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    }
  };

  // Add hashtag function
  const addHashtag = () => {
    if (!inputValue.trim()) return;

    // Clean hashtag (remove # if present and trim whitespace)
    const cleanHashtag = inputValue.trim().replace(/^#/, '');
    
    // Validate hashtag (basic validation)
    if (cleanHashtag.length === 0) return;
    
    // Check if already selected
    const alreadySelected = selectedHashtags.some(hashtag => 
      hashtag.name.toLowerCase() === cleanHashtag.toLowerCase()
    );
    
    if (alreadySelected) {
      setInputValue('');
      return;
    }

    const newHashtag: HashtagFilter = {
      name: cleanHashtag
    };

    const updatedHashtags = [...selectedHashtags, newHashtag];
    setSelectedHashtags(updatedHashtags);
    onFilterChange({ hashtags: updatedHashtags });
    
    // Clear input
    setInputValue('');
  };

  // Remove hashtag from selected list
  const handleRemoveHashtag = (hashtagName: string) => {
    const updatedHashtags = selectedHashtags.filter(hashtag => hashtag.name !== hashtagName);
    setSelectedHashtags(updatedHashtags);
    onFilterChange({ hashtags: updatedHashtags.length > 0 ? updatedHashtags : undefined });
  };

  // Clear all hashtags
  const clearAllHashtags = () => {
    setSelectedHashtags([]);
    onFilterChange({ hashtags: undefined });
  };

  // Clear input when component closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    } else {
      // Focus input when component opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const hasHashtags = selectedHashtags.length > 0;

  return (
    <div ref={wrapperRef}>
      <FilterComponent
        hasActiveFilters={hasHashtags}
        icon={<IoDocumentTextOutline size={16} />}
        title="Hashtags"
        isOpen={isOpen}
        onToggle={onToggle}
        className="border border-gray-200 rounded-md"
        selectedCount={selectedHashtags.length}
      >
        <div className="p-2 space-y-3">         
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-800">Add Hashtags</h3>
            </div>
            {hasHashtags && (
              <button
                onClick={clearAllHashtags}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Clear all hashtags"
              >
                <IoClose size={16} />
              </button>
            )}
          </div>

          {/* Description */}
          <div className="text-xs text-gray-600 bg-green-50 p-2 rounded-md border border-green-200">
            💡 Choose hashtags the influencer uses frequently (e.g., #fashion, #travel, #food)
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type hashtag and press Enter..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition-colors"
              />
            </div>
          </div>

          {/* Selected Hashtags */}
          {selectedHashtags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600">
                Selected Hashtags ({selectedHashtags.length}):
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {selectedHashtags.map((hashtag) => (
                  <div
                    key={hashtag.name}
                    className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                  >
                    <span className="text-green-600 mr-1">#</span>
                    <span className="font-medium max-w-28 truncate" title={hashtag.name}>
                      {hashtag.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(hashtag.name)}
                      className="ml-1.5 text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
                      title="Remove hashtag"
                    >
                      <IoClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedHashtags.length === 0 && (
            <div className="text-center py-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <IoDocumentTextOutline className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-sm text-gray-600 font-medium">No hashtags added</div>
              <div className="text-xs text-gray-500">Type hashtags and press Enter to add</div>
            </div>
          )}

        </div>
      </FilterComponent>
    </div>
  );
};

export default Hashtags;