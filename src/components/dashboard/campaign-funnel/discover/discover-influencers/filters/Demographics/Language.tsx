import React, { useState, useEffect, useRef } from 'react';
import { IoLanguageOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, CreatorLanguageFilter, AudienceLanguageFilter } from '@/lib/creator-discovery-types';

interface Language {
  name: string;
  code: string;
}

interface LanguageFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
}

const Language: React.FC<LanguageFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter
}) => {
  const [creatorSearchQuery, setCreatorSearchQuery] = useState('');
  const [audienceSearchQuery, setAudienceSearchQuery] = useState('');
  const [creatorLanguages, setCreatorLanguages] = useState<Language[]>([]);
  const [audienceLanguages, setAudienceLanguages] = useState<Language[]>([]);
  const [isLoadingCreator, setIsLoadingCreator] = useState(false);
  const [isLoadingAudience, setIsLoadingAudience] = useState(false);

  const creatorDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const audienceDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Search creator languages
  const searchCreatorLanguages = async (query: string) => {
    try {
      setIsLoadingCreator(true);
      const url = `/api/v0/discover/languages${query ? `?search=${encodeURIComponent(query)}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setCreatorLanguages(data.languages || []);
    } catch (error) {
      console.error('Error searching creator languages:', error);
      setCreatorLanguages([]);
    } finally {
      setIsLoadingCreator(false);
    }
  };

  // Search audience languages
  const searchAudienceLanguages = async (query: string) => {
    try {
      setIsLoadingAudience(true);
      const url = `/api/v0/discover/languages${query ? `?search=${encodeURIComponent(query)}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setAudienceLanguages(data.languages || []);
    } catch (error) {
      console.error('Error searching audience languages:', error);
      setAudienceLanguages([]);
    } finally {
      setIsLoadingAudience(false);
    }
  };

  // Debounced creator search
  useEffect(() => {
    if (creatorDebounceRef.current) {
      clearTimeout(creatorDebounceRef.current);
    }

    creatorDebounceRef.current = setTimeout(() => {
      searchCreatorLanguages(creatorSearchQuery);
    }, 300);

    return () => {
      if (creatorDebounceRef.current) {
        clearTimeout(creatorDebounceRef.current);
      }
    };
  }, [creatorSearchQuery]);

  // Debounced audience search
  useEffect(() => {
    if (audienceDebounceRef.current) {
      clearTimeout(audienceDebounceRef.current);
    }

    audienceDebounceRef.current = setTimeout(() => {
      searchAudienceLanguages(audienceSearchQuery);
    }, 300);

    return () => {
      if (audienceDebounceRef.current) {
        clearTimeout(audienceDebounceRef.current);
      }
    };
  }, [audienceSearchQuery]);

  // Load initial data when dropdown opens
  useEffect(() => {
    if (isOpen) {
      searchCreatorLanguages('');
      searchAudienceLanguages('');
    }
  }, [isOpen]);

  // Handle creator language selection
  const handleCreatorLanguageSelect = (language: Language) => {
    onFilterChange({
      creator_language: { code: language.code }
    });
    setCreatorSearchQuery('');
  };

  // Handle creator language removal
  const handleCreatorLanguageRemove = () => {
    onFilterChange({
      creator_language: undefined
    });
  };

  // Handle audience language toggle (single selection only)
  const handleAudienceLanguageToggle = (language: Language) => {
    const currentAudienceLanguages = filters.audience_language || [];
    const existingIndex = currentAudienceLanguages.findIndex(item => item.code === language.code);

    if (existingIndex >= 0) {
      // Remove the language (deselect)
      onFilterChange({
        audience_language: undefined
      });
    } else {
      // Replace with new single language selection
      const newLanguage: AudienceLanguageFilter = {
        code: language.code,
        percentage_value: "50"
      };
      onFilterChange({
        audience_language: [newLanguage]
      });
    }
  };

  // Handle audience percentage change
  const handleAudiencePercentageChange = (code: string, percentage: string) => {
    const numPercentage = parseInt(percentage);
    if (isNaN(numPercentage) || numPercentage < 1 || numPercentage > 100) return;

    const currentAudienceLanguages = filters.audience_language || [];
    const updatedLanguages = currentAudienceLanguages.map(item =>
      item.code === code
        ? { ...item, percentage_value: percentage }
        : item
    );

    onFilterChange({
      audience_language: updatedLanguages
    });
  };

  // Get selected states
  const selectedCreatorLanguage = filters.creator_language;
  const selectedAudienceLanguages = filters.audience_language || [];

  // Calculate total selected count
  const totalSelectedCount =
    (selectedCreatorLanguage ? 1 : 0) +
    selectedAudienceLanguages.length;

  // Get creator language name
  const getCreatorLanguageName = () => {
    if (!selectedCreatorLanguage) return null;
    const language = creatorLanguages.find(lang => lang.code === selectedCreatorLanguage.code);
    return language?.name || selectedCreatorLanguage.code;
  };

  const hasActiveFilters =
    !!selectedCreatorLanguage || selectedAudienceLanguages.length > 0;


  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoLanguageOutline size={18} />}
      title="Language"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount={totalSelectedCount}
    >
      {/* Empty content to prevent default padding/content */}
      <div className="hidden"></div>

      {/* Wide dropdown content - positioned to extend left */}
      <div className="absolute right-0 top-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[500px]">
        <div className="flex gap-4 p-3">

          {/* Creator Language Section */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h3 className="text-xs font-semibold text-gray-800">Creator Language</h3>
            </div>

            {/* Creator Language Search - Only show when no selection */}
            {!selectedCreatorLanguage && (
              <>
                <input
                  type="text"
                  placeholder="Search creator language..."
                  value={creatorSearchQuery}
                  onChange={(e) => setCreatorSearchQuery(e.target.value)}
                  className="w-full text-xs border border-purple-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />

                {/* Creator Language Results */}
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {isLoadingCreator ? (
                    <div className="text-xs text-gray-500 px-2 py-1">Searching...</div>
                  ) : creatorLanguages.length > 0 ? (
                    creatorLanguages.slice(0, 10).map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleCreatorLanguageSelect(language)}
                        className="w-full text-left text-xs p-1.5 hover:bg-purple-50 rounded transition-colors"
                      >
                        <div className="font-medium text-gray-800">{language.name}</div>
                        <div className="text-gray-500 text-xs">{language.code}</div>
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 px-2 py-1">No languages found</div>
                  )}
                </div>
              </>
            )}

            {/* Selected Creator Language Display (bottom) */}
            {selectedCreatorLanguage && (
              <div className="space-y-1">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-800">
                      {getCreatorLanguageName()}
                    </span>
                    <button
                      onClick={handleCreatorLanguageRemove}
                      className="text-purple-600 hover:text-purple-800 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-200"></div>

          {/* Audience Languages Section */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-xs font-semibold text-gray-800">Audience Languages</h3>
            </div>

            {/* Audience Language Search */}
            <input
              type="text"
              placeholder="Search audience language..."
              value={audienceSearchQuery}
              onChange={(e) => setAudienceSearchQuery(e.target.value)}
              className="w-full text-xs border border-blue-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {/* Audience Language Results - Only show when no selection */}
            {selectedAudienceLanguages.length === 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {isLoadingAudience ? (
                  <div className="text-xs text-gray-500 px-2 py-1">Searching...</div>
                ) : audienceLanguages.length > 0 ? (
                  audienceLanguages.slice(0, 10).map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleAudienceLanguageToggle(language)}
                      className="w-full text-left text-xs p-1.5 rounded transition-colors hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">{language.name}</div>
                          <div className="text-gray-500 text-xs">{language.code}</div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 px-2 py-1">No languages found</div>
                )}
              </div>
            )}

            {/* Selected Audience Language (bottom, like locations design) */}
            {selectedAudienceLanguages.length > 0 && (
              <div className="space-y-1">
                {selectedAudienceLanguages.map((item) => {
                  const language = audienceLanguages.find(lang => lang.code === item.code);
                  return (
                    <div key={item.code} className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-800">
                          {language?.name || item.code}
                        </span>
                        <button
                          onClick={() => handleAudienceLanguageToggle(language || { name: item.code, code: item.code })}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={parseInt(item.percentage_value)}
                          onChange={(e) => handleAudiencePercentageChange(item.code, e.target.value)}
                          className="w-12 text-xs text-center border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-blue-600">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </FilterComponent>
  );
};

export default Language;