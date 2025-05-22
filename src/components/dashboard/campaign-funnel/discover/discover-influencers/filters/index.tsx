// src/components/discover/filters/index.tsx

import React, { useState } from 'react';
import Filters from './Filters';
import InfluencerTable from './InfluencerTable';

const influencersData = [
  { name: 'Prista Candra', followers: '647.4M', engagements: '195.3K', avgLikes: '195.3K' },
  // Add more influencer objects...
];

const DiscoverSection: React.FC = () => {
  const [filteredInfluencers, setFilteredInfluencers] = useState(influencersData);

  const handleSearch = (searchTerm: string) => {
    const filtered = influencersData.filter(influencer => 
      influencer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInfluencers(filtered);
  };

  const handleSort = (sortOption: string) => {
    const sorted = [...filteredInfluencers].sort((a, b) => {
      if (sortOption === 'Followers') {
        return parseFloat(b.followers) - parseFloat(a.followers);
      }
      if (sortOption === 'Engagements') {
        return parseFloat(b.engagements) - parseFloat(a.engagements);
      }
      return parseFloat(b.avgLikes) - parseFloat(a.avgLikes);
    });
    setFilteredInfluencers(sorted);
  };

  return (
    <div>
      <h1>Influencers Result</h1>
      <Filters onSearch={handleSearch} onSort={handleSort} />
      <InfluencerTable influencers={filteredInfluencers} />
    </div>
  );
};

export default DiscoverSection;