import React, { useState, useEffect, useRef } from 'react';
import { IoDuplicateOutline } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface LookalikeAIProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface InfluencerResult {
  username: string;
  full_name?: string;
  profile_pic_url?: string;
}

const LookalikeAI: React.FC<LookalikeAIProps> = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const [similarToQuery, setSimilarToQuery] = useState('');
  const [contentSimilarQuery, setContentSimilarQuery] = useState('');
  const [similarToResults, setSimilarToResults] = useState<InfluencerResult[]>([]);
  const [contentSimilarResults, setContentSimilarResults] = useState<InfluencerResult[]>([]);
  const [isLoadingSimilarTo, setIsLoadingSimilarTo] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>(filters.lookalikes || []);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedInfluencers(filters.lookalikes || []);
  }, [filters.lookalikes]);

  const parseApiResponse = (data: any): InfluencerResult[] => {
    let results: InfluencerResult[] = [];

    if (Array.isArray(data)) {
      results = data;
    } else if (data?.data) {
      results = data.data;
    } else if (data?.users) {
      results = data.users;
    } else if (data?.results) {
      results = data.results;
    }

    return results.map(item => ({
      username: item.username || item.handle || item.name || 'unknown',
      full_name: item.full_name || item.display_name,
      profile_pic_url: item.profile_pic_url || item.avatar
    }));
  };

  const handleSimilarToSearch = async (query: string) => {
    if (query.length < 2) {
      setSimilarToResults([]);
      return;
    }

    setIsLoadingSimilarTo(true);
    try {
      const response = await fetch(`/api/imai/mentionfilter?q=${encodeURIComponent(query)}&type=lookalike`);
      const data = await response.json();
      const results = parseApiResponse(data);
      setSimilarToResults(results);
    } catch (error) {
      console.error('Error fetching similar influencers:', error);
      setSimilarToResults([]);
    } finally {
      setIsLoadingSimilarTo(false);
    }
  };

  const handleContentSimilarSearch = async (query: string) => {
    if (query.length < 2) {
      setContentSimilarResults([]);
      return;
    }

    setIsLoadingContent(true);
    try {
      const response = await fetch(`/api/imai/mentionfilter?q=${encodeURIComponent(query)}&type=content`);
      const data = await response.json();
      const results = parseApiResponse(data);
      setContentSimilarResults(results);
    } catch (error) {
      console.error('Error fetching content similar influencers:', error);
      setContentSimilarResults([]);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleAddInfluencer = (username: string) => {
    const influencer = username.startsWith('@') ? username : `@${username}`;
    const newInfluencers = [...new Set([...selectedInfluencers, influencer])];
    setSelectedInfluencers(newInfluencers);
    onFilterChange({ lookalikes: newInfluencers });
  };

  const handleRemoveInfluencer = (influencerToRemove: string) => {
    const newInfluencers = selectedInfluencers.filter(influencer => influencer !== influencerToRemove);
    setSelectedInfluencers(newInfluencers);
    onFilterChange({ lookalikes: newInfluencers });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(); // close dropdown when clicking outside
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <FilterComponent
      icon={<div className="flex items-center"><IoDuplicateOutline size={16} /><FaRobot size={10} className="ml-1" /></div>}
      title="LOOKALIKES AI"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4 relative" ref={dropdownRef}>
        {/* Similar influencers search */}
        <div className="relative">
          <h4 className="text-xs font-medium text-gray-600 mb-1">
            Find influencers that are similar to a specific Instagram influencer
          </h4>
          <input
            type="text"
            placeholder="@Name or @handle"
            value={similarToQuery}
            onChange={(e) => {
              setSimilarToQuery(e.target.value);
              handleSimilarToSearch(e.target.value);
            }}
            onFocus={() => similarToResults.length > 0 && onToggle()}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          {isLoadingSimilarTo && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}

          {isOpen && similarToResults.length > 0 && (
            <div className="absolute z-50 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 mt-1">
              {similarToResults.map((result) => (
                <div
                  key={result.username}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-purple-50"
                  onClick={() => {
                    handleAddInfluencer(result.username);
                    setSimilarToQuery('');
                    onToggle();
                  }}
                >
                  <span className="font-medium ml-3 block truncate">@{result.username}</span>
                  {result.full_name && (
                    <span className="ml-2 text-xs text-gray-500 truncate">{result.full_name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content similar influencers search */}
        <div className="relative">
          <h4 className="text-xs font-medium text-gray-600 mb-1">
            Find influencers with content similar to a specific Instagram influencer
          </h4>
          <input
            type="text"
            placeholder="@Name or @handle"
            value={contentSimilarQuery}
            onChange={(e) => {
              setContentSimilarQuery(e.target.value);
              handleContentSimilarSearch(e.target.value);
            }}
            onFocus={() => contentSimilarResults.length > 0 && onToggle()}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          {isLoadingContent && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}

          {isOpen && contentSimilarResults.length > 0 && (
            <div className="absolute z-50 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 mt-1">
              {contentSimilarResults.map((result) => (
                <div
                  key={result.username}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-purple-50"
                  onClick={() => {
                    handleAddInfluencer(result.username);
                    setContentSimilarQuery('');
                    onToggle();
                  }}
                >
                  <span className="font-medium ml-3 block truncate">@{result.username}</span>
                  {result.full_name && (
                    <span className="ml-2 text-xs text-gray-500 truncate">{result.full_name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected influencers */}
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Selected Influencers</h4>
          {selectedInfluencers.length > 0 ? (
            <div className="space-y-2">
              {selectedInfluencers.map((influencer) => (
                <div key={influencer} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-gray-700">{influencer}</span>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveInfluencer(influencer)}
                  >
                    <span className="text-xs">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No influencers selected</p>
          )}
        </div>

        <div className="mt-3">
          <p className="text-xs text-gray-500">
            Add influencers similar to your favorites based on content, audience, and engagement patterns.
          </p>
        </div>
      </div>
    </FilterComponent>
  );
};

export default LookalikeAI;
