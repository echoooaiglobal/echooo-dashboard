import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { FaRobot, FaTimes } from 'react-icons/fa';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface TopicsAIFilterProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface TopicResult {
  name: string;
  tag?: string;
  id?: string;
}

const TopicsAI: React.FC<TopicsAIFilterProps> = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<TopicResult[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    filters.keywords ? filters.keywords.split(',').filter(Boolean) : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatResults = (data: any): TopicResult[] => {
    if (!data) return [];
    console.log('Raw API response:', data);
    
    let formatted: TopicResult[] = [];
    
    if (Array.isArray(data)) {
      formatted = data.map(item => ({
        name: item.name || item.tag || item.id || '',
        tag: item.tag,
        id: item.id
      }));
    } else if (data.data && Array.isArray(data.data)) {
      formatted = data.data.map((item: any) => ({
        name: item.name || item.tag || item.id || '',
        tag: item.tag,
        id: item.id
      }));
    } else if (data.tags && Array.isArray(data.tags)) {
      formatted = data.tags.map((item: any) => ({
        name: item.name || item.tag || item.id || '',
        tag: item.tag,
        id: item.id
      }));
    } else {
      console.error('Unexpected API response format:', data);
    }

    return formatted.filter(item => item.name);
  };

  const fetchTags = useCallback(async () => {
    if (!search.trim() || search.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/imai/topictags?q=${encodeURIComponent(search.replace('#', ''))}&platform=instagram`);
      const data = await response.json();
      
      const formattedResults = formatResults(data);
      console.log('Formatted results:', formattedResults);
      setResults(formattedResults);
      setShowDropdown(formattedResults.length > 0);
    } catch (err) {
      console.error('API error:', err);
      setError('Failed to load hashtags');
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTags();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, fetchTags]);

  const handleAddTag = (tag: string) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!selectedTags.includes(formattedTag)) {
      const newTags = [...selectedTags, formattedTag];
      setSelectedTags(newTags);
      onFilterChange({ keywords: newTags.join(',') });
    }
    setSearch('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    onFilterChange({ keywords: newTags.join(',') });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <FilterComponent
      icon={
        <div className="flex items-center">
          <IoDocumentTextOutline size={16} />
          <FaRobot size={10} className="ml-1" />
        </div>
      }
      title="Topics AI"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 relative" ref={dropdownRef}>
        <h4 className="text-sm font-medium text-gray-700">
          Choose hashtags the influencer uses frequently
        </h4>

        <div className="relative">
          <input
            type="text"
            placeholder="#fashion #travel #food"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.length >= 2) {
                setShowDropdown(true);
              } else {
                setShowDropdown(false);
              }
            }}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          {loading && (
            <div className="absolute right-2 top-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>

        {error && <div className="text-red-500 text-xs">{error}</div>}

        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 mt-1">
            {results.map((result) => (
              <div
                key={result.name}
                className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm flex items-center"
                onClick={() => handleAddTag(result.name)}
              >
                #{result.name}
              </div>
            ))}
          </div>
        )}

        {selectedTags.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {tag}
                  <FaTimes
                    className="ml-2 cursor-pointer hover:text-purple-900"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
            </div>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default TopicsAI;
