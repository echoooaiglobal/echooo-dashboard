// src/components/discover/filters/InfluencerTable.tsx

import React from 'react';

interface Influencer {
  name: string;
  followers: string;
  engagements: string;
  avgLikes: string;
}

interface Props {
  influencers: Influencer[];
}

const InfluencerTable: React.FC<Props> = ({ influencers }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Influencer Name</th>
          <th>Followers</th>
          <th>Engagements</th>
          <th>Avg Likes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {influencers.map((influencer, index) => (
          <tr key={index}>
            <td>{influencer.name}</td>
            <td>{influencer.followers}</td>
            <td>{influencer.engagements}</td>
            <td>{influencer.avgLikes}</td>
            <td>
              <button>Add to Campaign</button>
              <button>Profile Insights</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InfluencerTable;
