// src/components/discover/filters/Filters.tsx

import React from 'react';

interface Props {
  onSearch: (searchTerm: string) => void;
  onSort: (sortOption: string) => void;
}

const Filters: React.FC<Props> = ({ onSearch, onSort }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOption, setSortOption] = React.useState('Followers');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    onSort(e.target.value);
  };

  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search Influencer"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <select value={sortOption} onChange={handleSortChange}>
        <option>Followers</option>
        <option>Engagements</option>
        <option>Avg Likes</option>
      </select>
    </div>
  );
};

export default Filters;
