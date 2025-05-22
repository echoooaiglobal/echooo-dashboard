import React from 'react';
import { IoPersonOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface GenderFilterProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Gender: React.FC<GenderFilterProps> = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      gender: value === '' 
        ? { code: '', weight: 0 } 
        : { code: value, weight: 0.3 }
    });
  };

  return (
    <FilterComponent
      icon={<IoPersonOutline size={18} />}
      title="Gender"
      isOpen={isOpen}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
    >
      <div className="space-y-3 p-3">
        <select
          value={filters.gender?.code || ''}
          onChange={handleGenderChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Any</option>
          <option value="FEMALE">Female</option>
          <option value="MALE">Male</option>
          <option value="OTHER">Other</option>
          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </select>
      </div>
    </FilterComponent>
  );
};

export default Gender;