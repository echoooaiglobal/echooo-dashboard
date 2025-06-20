// src/components/dashboard/profile-analytics/sections/PricingSection.tsx
'use client';

import { 
  Play,
  Clock,
  Camera,
  Star,
  Zap,
  Users,
  MapPin,
  Shield,
  Info
} from 'lucide-react';

interface PriceRange {
  min: number;
  max: number;
}

interface PostType {
  price_range: PriceRange;
}

interface Pricing {
  currency: string;
  post_type: {
    reels: PostType;
    story: PostType;
    static_post: PostType;
    carousel: PostType;
  };
}

interface PriceExplanation {
  level: string;
  description: string;
}

interface PriceExplanations {
  engagement: PriceExplanation;
  follower_level: PriceExplanation;
  audience_location: PriceExplanation;
  audience_credibility: PriceExplanation;
}

interface ProfileData {
  engagement_rate: number;
  top_interests: Array<{ name: string }>;
  location: { country: string };
  age_group: string;
  is_verified: boolean;
}

interface PricingSectionProps {
  pricing: Pricing;
  price_explanations: PriceExplanations;
  profile: ProfileData;
  formatCurrency: (amount: number) => string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  pricing,
  price_explanations,
  profile,
  formatCurrency
}) => {
  return (
    <div className="space-y-8">
      {/* Pricing Overview */}
      {/* <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Pricing Information</h3>
        <p className="text-lg opacity-90">Estimated collaboration rates in {pricing.currency}</p>
        <div className="mt-4 text-sm opacity-80">
          Based on engagement rate, audience quality, and market standards
        </div>
      </div> */}

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
};

export default PricingSection;