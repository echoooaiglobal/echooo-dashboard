import React, { useState } from 'react';
import { IoLanguageOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { LANGUAGES } from '@/lib/languages';

interface LanguageFilterProps {
  selectedLanguages: string[]; // array of language codes
  onSelect: (languageCodes: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Language: React.FC<LanguageFilterProps> = ({
  selectedLanguages,
  onSelect,
  isOpen,
  onToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = LANGUAGES.filter(language =>
    language.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageToggle = (code: string) => {
    const newSelection = selectedLanguages.includes(code)
      ? selectedLanguages.filter(langCode => langCode !== code)
      : [...selectedLanguages, code];
    onSelect(newSelection);
  };

  return (
    <FilterComponent
      icon={<IoLanguageOutline size={18} />}
      title="Language"
      isOpen={isOpen}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
    >
      <div className="space-y-3 p-3">
        <input
          type="text"
          placeholder="Search language"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
        />

        <div className="max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => (
                <label key={language.code} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(language.code)}
                    onChange={() => handleLanguageToggle(language.code)}
                    className="form-checkbox h-4 w-4 text-purple-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{language.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 px-2">
                {searchQuery ? 'No matching languages found' : 'No languages available'}
              </p>
            )}
          </div>
        </div>
      </div>
    </FilterComponent>
  );
};

export default Language;
