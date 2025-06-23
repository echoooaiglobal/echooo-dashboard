// src/components/dashboard/profile-analytics/sections/AnalyticsSection.tsx
'use client';

import { 
  BarChart3
} from 'lucide-react';
import { Profile, Pricing } from '@/types/insightiq/profile-analytics';
import { validateSectionProps, safeProfileAccess } from '@/types/section-component-types';

interface AnalyticsSectionProps {
  profile: Profile;
  pricing: Pricing | null;
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
  // Validate props
  const validation = validateSectionProps(profile);
  if (!validation.isValid) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <p className="text-gray-500">{validation.error}</p>
        </div>
      </div>
    );
  }

  // Safe access to profile data with fallbacks
  const topContents = safeProfileAccess(profile, p => p.top_contents, []);
  const audience = safeProfileAccess(profile, p => p.audience, null);
  const audienceCountries = audience?.countries ?? [];
  const audienceCities = audience?.cities ?? [];
  const followerReachability = safeProfileAccess(profile, p => p.audience?.follower_reachability, []);
  const credibilityScore = audience?.credibility_score ?? 0;
  const significantFollowersPercentage = audience?.significant_followers_percentage ?? 0;

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

        {/* Audience Reach Potential */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Audience Reach Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-3">Follower Reachability</h5>
              <div className="space-y-2">
                {followerReachability.map((reach, index) => (
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
                  <span>Top Country ({audienceCountries.length > 0 ? 
                    audienceCountries[0].code : 'NA'})</span>
                  <span className="font-medium">{audienceCountries.length > 0 ? audienceCountries[0].value.toFixed(1) : '0'}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Top City ({audienceCities.length > 0 ? audienceCities[0].name : 'NA'})</span>
                  <span className="font-medium">{audienceCities.length > 0 ? audienceCities[0].value.toFixed(1) : '0'}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Geographic Diversity</span>
                  <span className="font-medium">
                    {audienceCountries.length > 0 ? (100 - audienceCountries[0].value).toFixed(1) : '0'}%
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
              <li>• Audience primarily from {audienceCountries.length > 0 ? audienceCountries[0].code : 'NA'} ({audienceCountries.length > 0 ? audienceCountries[0].value.toFixed(1) : '0'}%)</li>
              <li>• {(credibilityScore * 100).toFixed(1)}% audience credibility score</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Collaboration Potential</h4>
            <ul className="space-y-2 text-sm opacity-90">
              {pricing && (
                <li>• Estimated post value: {formatCurrency(pricing.post_type.static_post.price_range.min)} - {formatCurrency(pricing.post_type.static_post.price_range.max)}</li>
              )}
              <li>• Best performing content type: Reels ({formatNumber(profile.average_reels_views)} avg views)</li>
              <li>• Target audience: {profile.gender || 'Not specified'} {profile.age_group || 'Not specified'}</li>
              <li>• Geographic reach: {audienceCountries.length}+ countries</li>
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