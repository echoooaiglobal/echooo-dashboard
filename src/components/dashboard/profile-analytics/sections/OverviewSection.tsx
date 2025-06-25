// src/components/dashboard/profile-analytics/sections/OverviewSection.tsx
'use client';

import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Play,
  Crown,
  BarChart3
} from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import { Profile } from '@/types/insightiq/profile-analytics';

interface OverviewSectionProps {
  profile: Profile;
  formatNumber: (num: number) => string;
  getEngagementLevel: (rate: number) => { level: string; color: string; bg: string };
  getInfluencerTier: (followers: number) => string;
}
 
const OverviewSection: React.FC<OverviewSectionProps> = ({
  profile,
  formatNumber,
  getEngagementLevel,
  getInfluencerTier
}) => {
  // Safe access to profile data with fallbacks
  const topContents = profile.top_contents || [];
  const audience = profile.audience || null;
  const credibilityScore = audience?.credibility_score ?? 0;
  const significantFollowersPercentage = audience?.significant_followers_percentage ?? 0;
  const reputationHistory = profile.reputation_history || [];

  // Prepare follower growth data
  const prepareFollowerGrowthData = () => {
    const historyData = reputationHistory.slice(-6);
    
    const followersData = [{
      id: 'followers',
      color: '#2563EB',
      data: historyData.map(month => ({
        x: month.month,
        y: month.follower_count
      }))
    }];

    const latestMonth = historyData[historyData.length - 1];
    const previousMonth = historyData[historyData.length - 2];
    const followerGrowth = previousMonth ? 
      ((latestMonth.follower_count - previousMonth.follower_count) / previousMonth.follower_count * 100) : 0;

    return { followersData, followerGrowth };
  };

  const { followersData, followerGrowth } = prepareFollowerGrowthData();

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Engagement Rate</p>
              <p className="text-2xl font-bold text-green-600">{profile.engagement_rate.toFixed(2)}%</p>
              <span className={`text-xs px-2 py-1 rounded-full ${getEngagementLevel(profile.engagement_rate).bg} ${getEngagementLevel(profile.engagement_rate).color}`}>
                {getEngagementLevel(profile.engagement_rate).level}
              </span>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg. Likes</p>
              <p className="text-2xl font-bold text-pink-600">{formatNumber(profile.average_likes)}</p>
              <p className="text-xs text-gray-500">per post</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg. Comments</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(profile.average_comments)}</p>
              <p className="text-xs text-gray-500">per post</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reels Views</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(profile.average_reels_views)}</p>
              <p className="text-xs text-gray-500">avg per reel</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Advanced Analytics
        </h3>
        
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {((profile.average_likes + profile.average_comments) / profile.follower_count * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">True Engagement</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {(profile.average_reels_views / profile.follower_count).toFixed(1)}x
            </div>
            <div className="text-sm text-gray-600">Reach Multiplier</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(credibilityScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Audience Quality</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {significantFollowersPercentage ? 
                significantFollowersPercentage.toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-600">Influential Followers</div>
          </div>
        </div>

        {/* Content Performance Breakdown */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Content Type Performance</h4>
          <div className="space-y-4">
            {['REELS', 'VIDEO', 'IMAGE'].map((type) => {
              const typeContents = topContents.filter(content => content.type === type);
              const avgEngagement = typeContents.length > 0 
                ? typeContents.reduce((sum, content) => sum + (content.engagement?.like_count || 0) + (content.engagement?.comment_count || 0), 0) / typeContents.length
                : 0;
              
              return (
                <div key={type} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium">{type}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                      style={{ width: `${Math.min((avgEngagement / 200000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="w-24 text-sm text-right">
                    {formatNumber(avgEngagement)} avg
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Follower Growth Trajectory and Engagement Rate Benchmark - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follower Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Follower Growth Trajectory</h2>
                <p className="text-gray-600 mt-1">Monthly progression over past 6 months</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Growth Rate</p>
                <p className="text-xl font-bold text-blue-600">{followerGrowth > 0 ? '+' : ''}{followerGrowth.toFixed(2)}%</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div style={{ height: '300px' }}>
              <ResponsiveLine
                data={followersData}
                margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 12,
                  tickRotation: 0,
                  format: value => {
                    const date = new Date(value + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 12,
                  tickRotation: 0,
                  format: value => formatNumber(value)
                }}
                colors={['#2563EB']}
                pointSize={8}
                pointColor="#ffffff"
                pointBorderWidth={2}
                pointBorderColor="#2563EB"
                lineWidth={3}
                useMesh={true}
                curve="catmullRom"
                enableGridX={false}
                enableGridY={true}
                gridYValues={4}
                animate={true}
                motionConfig="gentle"
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fontSize: 12,
                        fontWeight: 500,
                        fill: '#6B7280'
                      }
                    }
                  },
                  grid: {
                    line: {
                      stroke: '#F3F4F6',
                      strokeWidth: 1
                    }
                  }
                }}
                tooltip={({ point }) => (
                  <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-600">{point.data.x}</div>
                    <div className="text-lg font-bold text-blue-600">{formatNumber(point.data.y)} followers</div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Engagement Rate Benchmark */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900">Engagement Rate Benchmark</h2>
            <p className="text-gray-600 mt-1">Your performance vs. industry standards</p>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Your Engagement Rate</span>
                <span className="text-2xl font-bold text-purple-600">{profile.engagement_rate.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full relative"
                  style={{ width: `${Math.min((profile.engagement_rate / 6) * 100, 100)}%` }}
                >
                  <div className="absolute -top-5 text-xs font-semibold text-purple-600">
                    {profile.engagement_rate.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>3%</span>
                <span>6%+</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-semibold text-red-800 text-sm">Poor (0-1%)</p>
                  <p className="text-xs text-red-600">Needs improvement</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">0-1%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div>
                  <p className="font-semibold text-yellow-800 text-sm">Good (1-3%)</p>
                  <p className="text-xs text-yellow-600">You are here!</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-600">1-3%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-800 text-sm">Excellent (3%+)</p>
                  <p className="text-xs text-green-600">Top performers</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">3%+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info & Top Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Account Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type</span>
              <span className="font-medium">{profile.platform_account_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender</span>
              <span className="font-medium">{profile.gender || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Age Group</span>
              <span className="font-medium">{profile.age_group || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Content Count</span>
              <span className="font-medium">{profile.content_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Verified</span>
              <span className={`font-medium ${profile.is_verified ? 'text-green-600' : 'text-gray-400'}`}>
                {profile.is_verified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hidden Likes</span>
              <span className="font-medium">{(profile.posts_hidden_likes_percentage_value * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-600" />
            Top Interests
          </h3>
          <div className="space-y-3">
            {profile.top_interests && profile.top_interests.length > 0 ? (
              profile.top_interests.slice(0, 8).map((interest, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm">{interest.name}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No interests data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Brand Affinity */}
      {profile.brand_affinity && profile.brand_affinity.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-indigo-600" />
            Brand Affinity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {profile.brand_affinity.map((brand, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <div className="font-medium text-sm text-gray-800">{brand.name}</div>
                <div className="text-xs text-gray-500 mt-1">Brand Affinity</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewSection;