import React from 'react';
import StatCard from './components/StatCard';
import EngagementChart from './components/EngagementChart';

const InfluencerDetails: React.FC = () => {
  const followersData = [682, 684, 686, 688]; // Placeholder data
  const followingData = [120, 130, 140, 160]; // Placeholder data
  const likesData = [100, 150, 250, 300]; // Placeholder data
  const engagementData = [0, 134, 268, 402]; // Placeholder engagement data

  return (
    <div className="influencer-details">
      <h1>Influencer Details</h1>
      <div className="grid">
        <StatCard
          title="Followers"
          value="688M"
          trend="▲"
          trendChange="0.03% this month"
          trendColor="green"
          chartData={followersData}
        />
        <StatCard
          title="Following"
          value="150"
          trend="▲"
          trendChange="2.63% this month"
          trendColor="green"
          chartData={followingData}
        />
        <StatCard
          title="Likes"
          value="300K"
          trend="▼"
          trendChange="5.8% this month"
          trendColor="red"
          chartData={likesData}
        />
        <div className="engagement-rate">
          <EngagementChart data={engagementData} />
          <h2>Engagement Rate 0.04%</h2>
        </div>
      </div>
    </div>
  );
};

export default InfluencerDetails;