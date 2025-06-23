// src/components/dashboard/profile-analytics/sections/OverviewSection.tsx
'use client';

import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Play,
  Crown, 
  Verified,
  Mail,
  Building
} from 'lucide-react';
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

      {/* Account Info & Contact Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <Mail className="w-5 h-5 mr-2 text-blue-600" />
            Contact Details
          </h3>
          <div className="space-y-3">
            {profile.contact_details && profile.contact_details.length > 0 ? (
              profile.contact_details.map((contact, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 capitalize">{contact.type}</span>
                    {contact.verified && <Verified className="w-3 h-3 text-blue-500" />}
                  </div>
                  <a
                    href={contact.type === 'email' ? `mailto:${contact.value}` : contact.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm max-w-32 truncate"
                    title={contact.value}
                  >
                    {contact.label}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No contact details available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-600" />
            Top Interests
          </h3>
          <div className="space-y-3">
            {profile.top_interests && profile.top_interests.length > 0 ? (
              profile.top_interests.slice(0, 5).map((interest, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{interest.name}</span>
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
            <Building className="w-5 h-5 mr-2 text-indigo-600" />
            Brand Affinity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {profile.brand_affinity.map((brand, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">{brand.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewSection;