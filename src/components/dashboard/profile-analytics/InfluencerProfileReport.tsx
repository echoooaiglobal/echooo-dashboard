// src/components/dashboard/profile-analytics/InfluencerProfileReport.tsx
'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share, 
  MapPin, 
  Globe, 
  Crown, 
  Calendar,
  DollarSign,
  BarChart3,
  Target,
  Award,
  Instagram,
  Youtube,
  Verified,
  Mail,
  ExternalLink,
  Star,
  UserCheck,
  TrendingDown,
  Activity,
  PieChart,
  Languages,
  Flag,
  Building,
  Camera,
  Play,
  Bookmark,
  Hash,
  AtSign,
  ChevronRight,
  Info,
  Clock,
  Zap,
  Shield,
  AlertCircle
} from 'lucide-react';
import profileAnalysis from '@/lib/profile-analysis';

const InfluencerProfileReport: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'audience' | 'content' | 'pricing' | 'growth' | 'analytics'>('overview');
  const { profile, pricing, price_explanations } = profileAnalysis;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEngagementLevel = (rate: number) => {
    if (rate >= 6) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 3) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate >= 1) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getInfluencerTier = (followers: number) => {
    if (followers >= 1000000) return 'Mega Influencer';
    if (followers >= 100000) return 'Macro Influencer';
    if (followers >= 10000) return 'Mid-tier Influencer';
    if (followers >= 1000) return 'Micro Influencer';
    return 'Nano Influencer';
  };

  const OverviewSection = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={profile.image_url}
                alt={profile.full_name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Verified className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.full_name}</h1>
              <p className="text-lg opacity-90">@{profile.platform_username}</p>
              <p className="text-sm opacity-80 mt-2 max-w-md">{profile.introduction}</p>
              <div className="flex items-center mt-3 space-x-4">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location.city}, {profile.location.country}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{profile.language}</span>
                </span>
                <a 
                  href={profile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:opacity-80"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Profile</span>
                </a>
              </div>
            </div>
          </div>
          <div className="text-right space-y-4">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold">{formatNumber(profile.follower_count)}</div>
              <div className="text-sm opacity-80">Followers</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-lg font-bold">{getInfluencerTier(profile.follower_count)}</div>
              <div className="text-sm opacity-80">Tier</div>
            </div>
            <div className="text-sm opacity-90">
              Last updated: {new Date(profile.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

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
              <span className="font-medium">{profile.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Age Group</span>
              <span className="font-medium">{profile.age_group}</span>
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
            {profile.contact_details.map((contact, index) => (
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
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-gold-600" />
            Top Interests
          </h3>
          <div className="space-y-3">
            {profile.top_interests.slice(0, 5).map((interest, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">{interest.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Affinity */}
      {profile.brand_affinity.length > 0 && (
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

  const GrowthSection = () => (
    <div className="space-y-8">
      {/* Growth Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Growth & Performance Trends
        </h3>
        
        {/* Reputation History Chart */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Follower Growth History</h4>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.reputation_history.slice(-4).map((month, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(month.follower_count)}
                  </div>
                  <div className="text-sm text-gray-600">{month.month}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Avg Likes: {formatNumber(month.average_likes)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-600">
                  {(() => {
                    const history = profile.reputation_history;
                    if (history.length < 2) return 'N/A';
                    const latest = history[history.length - 1];
                    const previous = history[history.length - 2];
                    const growth = ((latest.follower_count - previous.follower_count) / previous.follower_count * 100).toFixed(1);
                    return `${growth > 0 ? '+' : ''}${growth}%`;
                  })()}
                </div>
                <div className="text-sm text-gray-600">Monthly Growth</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {profile.engagement_rate.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {formatNumber(profile.average_reels_views)}
                </div>
                <div className="text-sm text-gray-600">Avg Reels Views</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Rate Histogram */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Engagement Rate Comparison</h3>
        <div className="space-y-4">
          {profile.engagement_rate_histogram.slice(0, 10).map((band, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-32 text-sm">
                {band.min !== null ? `${band.min.toFixed(2)}%` : '0%'} - {band.max.toFixed(2)}%
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                  style={{ 
                    width: `${Math.min((band.total_profile_count / 150000) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <div className="w-20 text-sm text-right">
                {formatNumber(band.total_profile_count)}
              </div>
              {band.is_median && (
                <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Median
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AudienceSection = () => (
    <div className="space-y-8">
      {/* Audience Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6">Audience Demographics</h3>
        
        {/* Gender Distribution */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gender Distribution
          </h4>
          <div className="space-y-3">
            {profile.audience.gender_distribution.map((gender, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium">{gender.gender}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      gender.gender === 'MALE' ? 'bg-blue-500' : 
                      gender.gender === 'FEMALE' ? 'bg-pink-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${gender.value}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm font-medium text-right">{gender.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Age Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {profile.audience.gender_age_distribution
              .reduce((acc: any[], curr) => {
                const existing = acc.find(item => item.age_range === curr.age_range);
                if (existing) {
                  existing.value += curr.value;
                } else {
                  acc.push({ age_range: curr.age_range, value: curr.value });
                }
                return acc;
              }, [])
              .map((age, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{age.value.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">{age.age_range}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Flag className="w-5 h-5 mr-2" />
              Top Countries
            </h4>
            <div className="space-y-2">
              {profile.audience.countries.slice(0, 8).map((country, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{country.code}</span>
                  <span className="text-purple-600 font-semibold">{country.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Top Cities
            </h4>
            <div className="space-y-2">
              {profile.audience.cities.slice(0, 8).map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-sm">{city.name}</span>
                  <span className="text-purple-600 font-semibold text-sm">{city.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language & Ethnicity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Languages className="w-5 h-5 mr-2" />
            Audience Languages
          </h3>
          <div className="space-y-2">
            {profile.audience.languages.slice(0, 8).map((lang, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 uppercase">{lang.code}</span>
                <span className="font-medium">{lang.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Audience Ethnicity</h3>
          <div className="space-y-2">
            {profile.audience.ethnicities.map((ethnicity, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{ethnicity.name}</span>
                <span className="font-medium">{ethnicity.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audience Quality & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Audience Quality
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Credibility Score</span>
                <span className="text-2xl font-bold text-green-600">
                  {(profile.audience.credibility_score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${profile.audience.credibility_score * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Follower Types</h4>
              <div className="space-y-1">
                {profile.audience.follower_types.map((type, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600">{type.name.replace('_', ' ')}</span>
                    <span className="font-medium">{type.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">Significant Followers</span>
                <span className="font-medium">{profile.audience.significant_followers_percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Audience Interests</h3>
          <div className="space-y-2">
            {profile.audience.interests.slice(0, 8).map((interest, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">{interest.name}</span>
                <span className="font-medium text-sm">{interest.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Significant Followers */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Notable Followers ({profile.audience.significant_followers_percentage.toFixed(1)}% of total)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {profile.audience.significant_followers.slice(0, 12).map((follower, index) => (
            <div key={index} className="text-center p-3 border border-gray-200 rounded-lg">
              <img
                src={follower.image_url}
                alt={follower.platform_username}
                className="w-12 h-12 rounded-full mx-auto mb-2"
              />
              <div className="font-medium text-xs">@{follower.platform_username}</div>
              <div className="text-xs text-gray-500">{formatNumber(follower.follower_count)}</div>
              {follower.is_verified && <Verified className="w-3 h-3 text-blue-500 mx-auto mt-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Audience Likers Analysis */}
      {profile.audience_likers && profile.audience_likers.countries && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Audience Likers Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top Countries (Likers)</h4>
              <div className="space-y-2">
                {profile.audience_likers.countries.slice(0, 6).map((country, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{country.code}</span>
                    <span className="font-medium">{country.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Credibility Score (Likers)</h4>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {(profile.audience_likers.credibility_score * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${profile.audience_likers.credibility_score * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ContentSection = () => (
    <div className="space-y-8">
      {/* Top Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Top Performing Content
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {profile.top_contents.slice(0, 6).map((content, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {content.thumbnail_url && (
                <img
                  src={content.thumbnail_url}
                  alt="Content thumbnail"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    content.type === 'REELS' ? 'bg-purple-100 text-purple-700' :
                    content.type === 'VIDEO' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {content.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(content.published_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-3 line-clamp-3">{content.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{formatNumber(content.engagement.like_count)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{formatNumber(content.engagement.comment_count)}</span>
                  </span>
                  {content.engagement.share_count && (
                    <span className="flex items-center space-x-1">
                      <Share className="w-3 h-3" />
                      <span>{formatNumber(content.engagement.share_count)}</span>
                    </span>
                  )}
                  {content.engagement.play_count && (
                    <span className="flex items-center space-x-1">
                      <Play className="w-3 h-3" />
                      <span>{formatNumber(content.engagement.play_count)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Recent Content
        </h3>
        <div className="space-y-4">
          {profile.recent_contents.slice(0, 8).map((content, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  content.type === 'REELS' ? 'bg-purple-100' :
                  content.type === 'VIDEO' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {content.type === 'REELS' || content.type === 'VIDEO' ? 
                    <Play className="w-5 h-5" /> : 
                    <Camera className="w-5 h-5" />
                  }
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 line-clamp-2">{content.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(content.published_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatNumber(content.engagement.like_count)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatNumber(content.engagement.comment_count)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtags & Mentions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Top Hashtags
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.top_hashtags.slice(0, 15).map((hashtag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                title={`Used ${hashtag.value}% of the time`}
              >
                #{hashtag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AtSign className="w-5 h-5 mr-2" />
            Top Mentions
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {profile.top_mentions.slice(0, 12).map((mention, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-800">@{mention.name}</span>
                <span className="text-purple-600 font-medium">{mention.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsored Content */}
      {profile.sponsored_contents.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Sponsored Content History
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {profile.sponsored_contents.map((content, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                {content.thumbnail_url && (
                  <img
                    src={content.thumbnail_url}
                    alt="Sponsored content"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Sponsored
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(content.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-3 line-clamp-3">{content.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{content.engagement.like_count ? formatNumber(content.engagement.like_count) : 'N/A'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{formatNumber(content.engagement.comment_count)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const PricingSection = () => (
    <div className="space-y-8">
      {/* Pricing Overview */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Pricing Information</h3>
        <p className="text-lg opacity-90">Estimated collaboration rates in {pricing.currency}</p>
        <div className="mt-4 text-sm opacity-80">
          Based on engagement rate, audience quality, and market standards
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(pricing.post_type).map(([postType, priceData]) => (
          <div key={postType} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {postType === 'reels' && <Play className="w-8 h-8 text-white" />}
                {postType === 'story' && <Clock className="w-8 h-8 text-white" />}
                {postType === 'static_post' && <Camera className="w-8 h-8 text-white" />}
                {postType === 'carousel' && <Star className="w-8 h-8 text-white" />}
              </div>
              <h4 className="text-lg font-semibold capitalize mb-2">
                {postType.replace('_', ' ')}
              </h4>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(priceData.price_range.min)} - {formatCurrency(priceData.price_range.max)}
              </div>
              <p className="text-sm text-gray-600">Per post</p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Explanations */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6">Pricing Factors Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(price_explanations).map(([factor, data]) => (
            <div key={factor} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize flex items-center">
                  {factor === 'engagement' && <Zap className="w-4 h-4 mr-2" />}
                  {factor === 'follower_level' && <Users className="w-4 h-4 mr-2" />}
                  {factor === 'audience_location' && <MapPin className="w-4 h-4 mr-2" />}
                  {factor === 'audience_credibility' && <Shield className="w-4 h-4 mr-2" />}
                  {factor.replace('_', ' ')}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  data.level === 'Very High' ? 'bg-red-100 text-red-800' :
                  data.level === 'High' ? 'bg-orange-100 text-orange-800' :
                  data.level === 'Micro Influencer' ? 'bg-blue-100 text-blue-800' :
                  data.level === 'Low' ? 'bg-green-100 text-green-800' :
                  data.level === 'Tier 3' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {data.level}
                </span>
              </div>
              <p className="text-sm text-gray-600">{data.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Recommendations */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
          <Info className="w-5 h-5 mr-2" />
          Collaboration Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-blue-800">✓ Strengths:</div>
            <ul className="space-y-1 text-blue-700">
              <li>• High engagement rate ({profile.engagement_rate.toFixed(2)}%)</li>
              <li>• Strong audience interaction</li>
              <li>• Consistent content creation</li>
              {profile.is_verified && <li>• Verified account status</li>}
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-blue-800">📋 Best For:</div>
            <ul className="space-y-1 text-blue-700">
              <li>• {profile.top_interests[0]?.name} campaigns</li>
              <li>• {profile.location.country} market targeting</li>
              <li>• {profile.age_group} demographic</li>
              <li>• Authentic brand partnerships</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyticsSection = () => (
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
              <li>• Content focus: {profile.top_interests.slice(0, 2).map(i => i.name).join(', ')}</li>
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'audience', label: 'Audience', icon: Users },
          { id: 'content', label: 'Content', icon: Target },
          { id: 'growth', label: 'Growth', icon: TrendingUp },
          { id: 'pricing', label: 'Pricing', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: Activity },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 min-w-0 ${
              activeSection === id
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{label}</span>
          </button>
        ))}
      </div>
 
      {/* Content */}
      <div className="min-h-screen">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'audience' && <AudienceSection />}
        {activeSection === 'content' && <ContentSection />}
        {activeSection === 'growth' && <GrowthSection />}
        {activeSection === 'pricing' && <PricingSection />}
        {activeSection === 'analytics' && <AnalyticsSection />}
      </div>
    </div>
  );
};

export default InfluencerProfileReport;