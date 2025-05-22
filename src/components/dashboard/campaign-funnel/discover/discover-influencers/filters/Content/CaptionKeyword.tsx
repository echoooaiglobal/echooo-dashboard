import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoTextOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface CaptionKeywordProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface KeywordSuggestion {
  keyword: string;
}

const CaptionKeyword: React.FC<CaptionKeywordProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
}) => {
  const [keyword, setKeyword] = useState<string>(filters.keywords || '');
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldUpdateParent = useRef<boolean>(false);

  useEffect(() => {
    if (filters.keywords !== undefined && filters.keywords !== keyword) {
      setKeyword(filters.keywords);
    }
  }, [filters.keywords]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/keywords/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      let results: KeywordSuggestion[] = [];

      if (Array.isArray(data)) {
        results = data.map(item => ({ keyword: item }));
      } else if (data?.suggestions) {
        results = data.suggestions.map((item: any) => ({
          keyword: typeof item === 'string' ? item : item.keyword
        }));
      } else if (data?.results) {
        results = data.results.map((item: any) => ({
          keyword: typeof item === 'string' ? item : item.keyword
        }));
      } else if (data?.data) {
        results = data.data.map((item: any) => ({
          keyword: typeof item === 'string' ? item : item.keyword
        }));
      }

      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching keyword suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!shouldUpdateParent.current) return;

    const timer = setTimeout(() => {
      const trimmed = keyword.trim();
      onFilterChange({ keywords: trimmed || undefined });
      shouldUpdateParent.current = false;
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, onFilterChange]);

  useEffect(() => {
    if (keyword.length > 1) {
      fetchSuggestions(keyword);
    } else {
      setSuggestions([]);
    }
  }, [keyword, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    shouldUpdateParent.current = true;
    setKeyword(e.target.value);
  };

  const handleSelectKeyword = (selected: string) => {
    shouldUpdateParent.current = true;
    setKeyword(selected);
    setSuggestions([]);
    onToggle(); // Close the dropdown
  };

  const clearKeyword = () => {
    shouldUpdateParent.current = true;
    setKeyword('');
    setSuggestions([]);
    onFilterChange({ keywords: undefined });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(); // Close when clicking outside
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <FilterComponent
      icon={<IoTextOutline size={18} />}
      title="Caption Keyword"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 relative" ref={dropdownRef}>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Caption Keyword</h4>
          <p className="text-xs text-gray-500 mb-2">
            Tip: Search using the influencer's native language (e.g., German for German influencers).
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search keywords..."
              value={keyword}
              onChange={handleInputChange}
              onFocus={onToggle}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {isLoading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              </div>
            )}
          </div>
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 mt-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-purple-50"
                onClick={() => handleSelectKeyword(suggestion.keyword)}
              >
                <div className="flex items-center">
                  <span className="font-medium ml-3 block truncate">{suggestion.keyword}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {keyword && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">Filtering by keyword:</p>
            <div className="bg-purple-100 inline-flex items-center rounded-full px-3 py-1 mt-1">
              <span className="text-xs text-purple-800">{keyword}</span>
              <button
                onClick={clearKeyword}
                className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default CaptionKeyword;
