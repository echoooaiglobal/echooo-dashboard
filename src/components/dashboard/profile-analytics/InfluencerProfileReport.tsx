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
  Verified
} from 'lucide-react';
import profileAnalysis from '@/lib/profile-analysis';

const PaymentsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'audience' | 'content' | 'pricing'>('overview');
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
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold">{formatNumber(profile.follower_count)}</div>
              <div className="text-sm opacity-80">Followers</div>
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
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
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
    </div>
  );

  const AudienceSection = () => (
    <div className="space-y-8">
      {/* Audience Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6">Audience Demographics</h3>
        
        {/* Gender Distribution */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Gender Distribution</h4>
          <div className="space-y-3">
            {profile.audience.gender_distribution.map((gender, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium">{gender.gender}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                    style={{ width: `${gender.value}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm font-medium text-right">{gender.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Top Countries</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.audience.countries.slice(0, 6).map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{country.code}</span>
                <span className="text-purple-600 font-semibold">{country.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div>
          <h4 className="text-lg font-medium mb-4">Top Cities</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.audience.cities.slice(0, 6).map((city, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">{city.name}</span>
                <span className="text-purple-600 font-semibold text-sm">{city.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audience Credibility */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6">Audience Quality</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Credibility Score</h4>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-green-600">
                {(profile.audience.credibility_score * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600">High Quality</div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Follower Types</h4>
            <div className="space-y-2">
              {profile.audience.follower_types.map((type, index) => (
                <div key={index} className="flex justify-between">
                  <span className="capitalize text-gray-600">{type.name.replace('_', ' ')}</span>
                  <span className="font-medium">{type.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ContentSection = () => (
    <div className="space-y-8">
      {/* Top Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6">Top Performing Content</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {profile.top_contents.slice(0, 6).map((content, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              {content.thumbnail_url && (
                <img
                  src={content.thumbnail_url}
                  alt="Content thumbnail"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-2">{content.type}</p>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Hashtags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Top Hashtags</h3>
          <div className="flex flex-wrap gap-2">
            {profile.top_hashtags.slice(0, 10).map((hashtag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                #{hashtag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Top Mentions</h3>
          <div className="space-y-2">
            {profile.top_mentions.slice(0, 8).map((mention, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-800">@{mention.name}</span>
                <span className="text-purple-600 font-medium">{mention.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const PricingSection = () => (
    <div className="space-y-8">
      {/* Pricing Overview */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Pricing Information</h3>
        <p className="text-lg opacity-90">Estimated collaboration rates in {pricing.currency}</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(pricing.post_type).map(([postType, priceData]) => (
          <div key={postType} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-center">
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
        <h3 className="text-xl font-semibold mb-6">Pricing Factors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(price_explanations).map(([factor, data]) => (
            <div key={factor} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{factor.replace('_', ' ')}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  data.level === 'Very High' ? 'bg-red-100 text-red-800' :
                  data.level === 'High' ? 'bg-orange-100 text-orange-800' :
                  data.level === 'Micro Influencer' ? 'bg-blue-100 text-blue-800' :
                  data.level === 'Low' ? 'bg-green-100 text-green-800' :
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
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'audience', label: 'Audience', icon: Users },
          { id: 'content', label: 'Content', icon: Target },
          { id: 'pricing', label: 'Pricing', icon: DollarSign },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
              activeSection === id
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-screen">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'audience' && <AudienceSection />}
        {activeSection === 'content' && <ContentSection />}
        {activeSection === 'pricing' && <PricingSection />}
      </div>
    </div>
  );
};

export default PaymentsTab;