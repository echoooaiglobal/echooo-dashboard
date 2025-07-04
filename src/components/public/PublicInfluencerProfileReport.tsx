// src/components/public/PublicInfluencerProfileReport.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Eye, 
  TrendingUp, 
  DollarSign,
  Share2,
  Download,
  Calendar,
  MapPin,
  Globe,
  Verified,
  BarChart3,
  PieChart,
  Clock,
  Hash,
  Image as ImageIcon,
  Play,
  Grid3X3,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw
} from 'lucide-react';

interface ProfileAnalyticsData {
  profile: {
    username: string;
    displayName: string;
    bio: string;
    followerCount: number;
    followingCount: number;
    postCount: number;
    profilePictureUrl: string;
    isVerified: boolean;
    category: string;
    website: string;
    location: string;
    joinedDate: string;
  };
  analytics: {
    engagementRate: number;
    avgLikes: number;
    avgComments: number;
    avgViews: number;
    totalPosts: number;
    reachRate: number;
    impressions: number;
    saves: number;
    shares: number;
  };
  audience: {
    demographics: {
      ageGroups: Array<{ range: string; percentage: number }>;
      gender: Array<{ type: string; percentage: number }>;
      topCountries: Array<{ country: string; percentage: number }>;
      topCities: Array<{ city: string; percentage: number }>;
    };
    interests: Array<{ category: string; percentage: number }>;
    activityTimes: Array<{ hour: number; engagement: number }>;
  };
  content: {
    topPosts: Array<{
      id: string;
      imageUrl: string;
      likes: number;
      comments: number;
      views: number;
      caption: string;
      timestamp: string;
    }>;
    hashtagPerformance: Array<{ hashtag: string; usage: number; avgEngagement: number }>;
    contentTypes: Array<{ type: string; percentage: number; avgEngagement: number }>;
  };
  pricing: {
    postPrice: number;
    storyPrice: number;
    reelPrice: number;
    currency: string;
    factors: Array<{ factor: string; impact: string }>;
  };
  audienceLikers: {
    topLikers: Array<{
      username: string;
      profilePictureUrl: string;
      followerCount: number;
      engagementRate: number;
      totalLikes: number;
    }>;
    demographics: {
      ageGroups: Array<{ range: string; percentage: number }>;
      gender: Array<{ type: string; percentage: number }>;
      topCountries: Array<{ country: string; percentage: number }>;
    };
    interests: Array<{ category: string; percentage: number }>;
  };
  audienceCommenters: {
    topCommenters: Array<{
      username: string;
      profilePictureUrl: string;
      followerCount: number;
      engagementRate: number;
      totalComments: number;
    }>;
    demographics: {
      ageGroups: Array<{ range: string; percentage: number }>;
      gender: Array<{ type: string; percentage: number }>;
      topCountries: Array<{ country: string; percentage: number }>;
    };
    interests: Array<{ category: string; percentage: number }>;
    sentimentAnalysis: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
}

interface PublicInfluencerProfileReportProps {
  platformAccountId: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const PublicInfluencerProfileReport: React.FC<PublicInfluencerProfileReportProps> = ({
  platformAccountId
}) => {
  const [data, setData] = useState<ProfileAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/v0/profile-analytics/public/${platformAccountId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile analytics');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date(result.timestamp));
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (platformAccountId) {
      fetchData();
    }
  }, [platformAccountId]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${data?.profile.displayName} - Profile Analytics`,
          text: `Check out this influencer profile analytics report`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Report link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownload = () => {
    // Generate PDF or export functionality
    alert('Download functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Report</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Analytics Report</h1>
          <p className="text-gray-600 mt-1">
            Live analytics data for @{data.profile.username}
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Profile Overview */}
      <Card className="p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <img
              src={data.profile.profilePictureUrl}
              alt={data.profile.displayName}
              className="w-24 h-24 rounded-full object-cover"
            />
            {data.profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <Verified className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{data.profile.displayName}</h2>
              <Badge variant="secondary">{data.profile.category}</Badge>
            </div>
            
            <p className="text-lg text-gray-600 mb-2">@{data.profile.username}</p>
            <p className="text-gray-700 mb-4">{data.profile.bio}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {data.profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {data.profile.location}
                </div>
              )}
              {data.profile.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <a href={data.profile.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    Website
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(data.profile.joinedDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{formatNumber(data.profile.followerCount)}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatNumber(data.profile.followingCount)}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatNumber(data.profile.postCount)}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-green-600">{data.analytics.engagementRate}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Likes</p>
              <p className="text-2xl font-bold text-red-600">{formatNumber(data.analytics.avgLikes)}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Comments</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(data.analytics.avgComments)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Views</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(data.analytics.avgViews)}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="audience" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="likers">Top Likers</TabsTrigger>
          <TabsTrigger value="commenters">Top Commenters</TabsTrigger>
        </TabsList>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Demographics
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Age Groups</h4>
                  <div className="space-y-2">
                    {data.audience.demographics.ageGroups.map((age, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{age.range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${age.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{age.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Gender</h4>
                  <div className="space-y-2">
                    {data.audience.demographics.gender.map((gender, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{gender.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-pink-500 h-2 rounded-full" 
                              style={{ width: `${gender.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{gender.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Top Locations
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Countries</h4>
                  <div className="space-y-2">
                    {data.audience.demographics.topCountries.slice(0, 5).map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{country.country}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{country.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Cities</h4>
                  <div className="space-y-2">
                    {data.audience.demographics.topCities.slice(0, 5).map((city, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{city.city}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${city.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{city.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Interests */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Audience Interests
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.audience.interests.map((interest, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{interest.category}</span>
                  <Badge variant="secondary">{interest.percentage}%</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Top Posts */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Top Performing Posts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.content.topPosts.map((post, index) => (
                <div key={post.id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={`Post ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.caption}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          {formatNumber(post.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          {formatNumber(post.comments)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-purple-500" />
                          {formatNumber(post.views)}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Content Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Content Types
              </h3>
              <div className="space-y-3">
                {data.content.contentTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`} />
                      <span className="font-medium">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{type.percentage}%</div>
                      <div className="text-sm text-gray-500">{type.avgEngagement}% eng.</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Hash className="h-5 w-5 mr-2" />
                Top Hashtags
              </h3>
              <div className="space-y-3">
                {data.content.hashtagPerformance.map((hashtag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium text-blue-600">{hashtag.hashtag}</span>
                    <div className="text-right">
                      <div className="font-semibold">{hashtag.usage} uses</div>
                      <div className="text-sm text-gray-500">{hashtag.avgEngagement}% eng.</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Estimated Pricing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <ImageIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.pricing.postPrice, data.pricing.currency)}
                </div>
                <div className="text-sm text-gray-600">Per Post</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.pricing.storyPrice, data.pricing.currency)}
                </div>
                <div className="text-sm text-gray-600">Per Story</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <Play className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(data.pricing.reelPrice, data.pricing.currency)}
                </div>
                <div className="text-sm text-gray-600">Per Reel</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Pricing Factors</h4>
              <div className="space-y-2">
                {data.pricing.factors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {factor.impact === 'positive' ? (
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                    ) : factor.impact === 'negative' ? (
                      <ThumbsDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm">{factor.factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Likers Tab */}
        <TabsContent value="likers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Top Likers
              </h3>
              <div className="space-y-4">
                {data.audienceLikers.topLikers.map((liker, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={liker.profilePictureUrl} 
                        alt={liker.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">@{liker.username}</div>
                        <div className="text-sm text-gray-500">
                          {formatNumber(liker.followerCount)} followers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{liker.totalLikes} likes</div>
                      <div className="text-sm text-gray-500">{liker.engagementRate}% eng.</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Likers Demographics
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Age Distribution</h4>
                  {data.audienceLikers.demographics.ageGroups.map((age, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                      <span className="text-sm">{age.range}</span>
                      <span className="text-sm font-medium">{age.percentage}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Gender</h4>
                  {data.audienceLikers.demographics.gender.map((gender, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                      <span className="text-sm">{gender.type}</span>
                      <span className="text-sm font-medium">{gender.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Likers Interests
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.audienceLikers.interests.map((interest, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">{interest.category}</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {interest.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Commenters Tab */}
        <TabsContent value="commenters" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Top Commenters
              </h3>
              <div className="space-y-4">
                {data.audienceCommenters.topCommenters.map((commenter, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={commenter.profilePictureUrl} 
                        alt={commenter.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">@{commenter.username}</div>
                        <div className="text-sm text-gray-500">
                          {formatNumber(commenter.followerCount)} followers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{commenter.totalComments} comments</div>
                      <div className="text-sm text-gray-500">{commenter.engagementRate}% eng.</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Comment Sentiment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full" />
                    <span>Positive</span>
                  </div>
                  <span className="font-semibold">{data.audienceCommenters.sentimentAnalysis.positive}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-gray-400 rounded-full" />
                    <span>Neutral</span>
                  </div>
                  <span className="font-semibold">{data.audienceCommenters.sentimentAnalysis.neutral}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full" />
                    <span>Negative</span>
                  </div>
                  <span className="font-semibold">{data.audienceCommenters.sentimentAnalysis.negative}%</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Commenters Interests
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.audienceCommenters.interests.map((interest, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">{interest.category}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {interest.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card className="p-6 text-center bg-gray-50">
        <p className="text-gray-600 mb-2">
          This report contains live analytics data and is updated in real-time.
        </p>
        <p className="text-sm text-gray-500">
          Generated on {new Date().toLocaleString()} | 
          <Button variant="link" className="p-0 ml-1 h-auto" onClick={handleShare}>
            Share this report
          </Button>
        </p>
      </Card>
    </div>
  );
};

export default PublicInfluencerProfileReport;