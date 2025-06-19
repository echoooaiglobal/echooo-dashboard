// src/components/dashboard/profile-analytics/sections/AnalyticsSection.tsx
'use client';

import { 
  BarChart3
} from 'lucide-react';

interface Content {
  type: string;
  engagement: {
    like_count: number;
    comment_count: number;
  };
}

interface Audience {
  credibility_score: number;
  significant_followers_percentage: number;
  countries: Array<{ code: string; value: number }>;
  cities: Array<{ name: string; value: number }>;
  follower_reachability: Array<{ following_range: string; value: number }>;
}

interface Pricing {
  currency: string;
  post_type: {
    static_post: {
      price_range: {
        min: number;
        max: number;
      };
    };
  };
}

interface ProfileData {
  average_likes: number;
  average_comments: number;
  follower_count: number;
  average_reels_views: number;
  top_contents: Content[];
  audience: Audience;
  engagement_rate: number;
  full_name: string;
  gender: string;
  age_group: string;
  is_verified: boolean;
  report_generated_at: string;
  updated_at: string;
}

interface AnalyticsSectionProps {
  profile: ProfileData;
  pricing: Pricing;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
  getInfluencerTier: (followers: number) => string;
  getEngagementLevel: (rate: number) => { level: string };
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  profile,
  pricing,
  formatNumber,
  formatCurrency,
  getInfluencerTier,
  getEngagementLevel
}) => {
  return (
    <div className="space-y-8">
      {/* Performance Overview */}
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
              {(profile.audience.credibility_score * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Audience Quality</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {profile.audience.significant_followers_percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Influential Followers</div>
          </div>
        </div>

        {/* Content Performance Breakdown */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Content Type Performance</h4>
          <div className="space-y-4">
            {['REELS', 'VIDEO', 'IMAGE'].map((type) => {
              const typeContents = profile.top_contents.filter(content => content.type === type);
              const avgEngagement = typeContents.length > 0 
                ? typeContents.reduce((sum, content) => sum + content.engagement.like_count + content.engagement.comment_count, 0) / typeContents.length
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

        {/* Audience Reach Potential */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Audience Reach Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-3">Follower Reachability</h5>
              <div className="space-y-2">
                {profile.audience.follower_reachability.map((reach, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{reach.following_range} following</span>
                    <span className="font-medium">{reach.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-3">Geographic Concentration</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Top Country ({profile.audience.countries[0]?.code})</span>
                  <span className="font-medium">{profile.audience.countries[0]?.value.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Top City ({profile.audience.cities[0]?.name})</span>
                  <span className="font-medium">{profile.audience.cities[0]?.value.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Geographic Diversity</span>
                  <span className="font-medium">
                    {(100 - profile.audience.countries[0]?.value).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
        <h3 className="text-xl font-semibold mb-6">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium mb-4">Profile Highlights</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• {getInfluencerTier(profile.follower_count)} with {formatNumber(profile.follower_count)} followers</li>
              <li>• {getEngagementLevel(profile.engagement_rate).level} engagement rate ({profile.engagement_rate.toFixed(2)}%)</li>
              <li>• Audience primarily from {profile.audience.countries[0]?.code} ({profile.audience.countries[0]?.value.toFixed(1)}%)</li>
              <li>• {(profile.audience.credibility_score * 100).toFixed(1)}% audience credibility score</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Collaboration Potential</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• Estimated post value: {formatCurrency(pricing.post_type.static_post.price_range.min)} - {formatCurrency(pricing.post_type.static_post.price_range.max)}</li>
              <li>• Best performing content type: Reels ({formatNumber(profile.average_reels_views)} avg views)</li>
              <li>• Target audience: {profile.gender} {profile.age_group}</li>
              <li>• Geographic reach: {profile.audience.countries.length}+ countries</li>
              <li>• Brand safety: {profile.is_verified ? 'Verified account' : 'Unverified account'}</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-sm opacity-75">
            Report generated on {new Date(profile.report_generated_at).toLocaleDateString()} • 
            Data last updated {new Date(profile.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;