import React, { useState, useEffect, useRef } from 'react';
import { IoAtOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface MentionsProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface MentionResult {
  username: string;
  full_name?: string;
  profile_pic_url?: string;
}

const Mentions: React.FC<MentionsProps> = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mentions, setMentions] = useState<string[]>(filters.hashtags || []);
  const [searchResults, setSearchResults] = useState<MentionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMentions(filters.hashtags || []);
  }, [filters.hashtags]);

  const parseApiResponse = (data: any): MentionResult[] => {
    let results: MentionResult[] = [];

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

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/imai/mentionfilter?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      const formattedResults = parseApiResponse(data);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error fetching mentions:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMention = (username: string) => {
    const mention = username.startsWith('@') ? username : `@${username}`;
    const updated = [...new Set([...mentions, mention])];
    setMentions(updated);
    onFilterChange({ hashtags: updated });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMention = (mentionToRemove: string) => {
    const updated = mentions.filter(m => m !== mentionToRemove);
    setMentions(updated);
    onFilterChange({ hashtags: updated });
  };

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
    <FilterComponent icon={<IoAtOutline size={18} />} title="Mentions" isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-3 relative" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search @username or #hashtag"
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              handleSearch(value);
            }}
            onFocus={onToggle}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}
        </div>

        {isOpen && searchResults.length > 0 && (
          <div className="absolute z-50 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 mt-1">
            {searchResults.map((result) => (
              <div
                key={result.username}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-purple-50"
                onClick={() => handleAddMention(result.username)}
              >
                <div className="flex items-center">
                  <span className="font-medium ml-3 block truncate">@{result.username}</span>
                  {result.full_name && (
                    <span className="ml-2 text-xs text-gray-500 truncate">{result.full_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Selected Mentions</h4>
          {mentions.length > 0 ? (
            <div className="space-y-2">
              {mentions.map((mention) => (
                <div key={mention} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-gray-700">{mention}</span>
                  <button
                    className="text-red-500 hover:text-red-700 text-xs"
                    onClick={() => handleRemoveMention(mention)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No mentions selected</p>
          )}
        </div>
      </div>
    </FilterComponent>
  );
};

export default Mentions;
