// src/components/dashboard/profile-analytics/sections/GrowthSection.tsx
'use client';

import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { TrendingUp, Users, Heart, BarChart3 } from 'lucide-react';
import { Profile } from '@/types/insightiq/profile-analytics';
import { BaseSectionProps, validateSectionProps, safeProfileAccess } from '@/types/section-component-types';

interface GrowthSectionProps extends BaseSectionProps {}

const GrowthSection: React.FC<GrowthSectionProps> = ({ profile, formatNumber }) => {
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

  // Safe access to reputation history with fallback
  const reputationHistory = safeProfileAccess(profile, p => p.reputation_history, []);

  // Prepare data for charts
  const prepareChartData = () => {
    const historyData = reputationHistory.slice(-6);
    
    // Line chart data for followers
    const followersData = [{
      id: 'followers',
      color: '#2563EB',
      data: historyData.map(month => ({
        x: month.month,
        y: month.follower_count
      }))
    }];

    // Bar chart data for likes
    const likesBarData = historyData.map(month => ({
      month: month.month,
      likes: month.average_likes
    }));

    return { followersData, likesBarData, historyData };
  };

  const { followersData, likesBarData, historyData } = prepareChartData();

  // Calculate key metrics
  const latestMonth = historyData[historyData.length - 1];
  const previousMonth = historyData[historyData.length - 2];
  const followerGrowth = previousMonth ? 
    ((latestMonth.follower_count - previousMonth.follower_count) / previousMonth.follower_count * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                followerGrowth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {followerGrowth > 0 ? '+' : ''}{followerGrowth.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Followers</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(profile.follower_count)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Likes</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(profile.average_likes)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Engagement Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{profile.engagement_rate.toFixed(2)}%</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Posts</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{profile.content_count}</p>
          </div>
        </div>

        {/* Main Charts Grid */}
        <div className="space-y-8">
          
          {/* Follower Growth Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 p-8 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Follower Growth Trajectory</h2>
                  <p className="text-gray-600 mt-2">Monthly progression of follower count over the past 6 months</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Current Growth Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{followerGrowth > 0 ? '+' : ''}{followerGrowth.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div style={{ height: '400px' }}>
                <ResponsiveLine
                  data={followersData}
                  margin={{ top: 20, right: 60, bottom: 80, left: 100 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 16,
                    tickRotation: 0,
                    format: value => {
                      const date = new Date(value + '-01');
                      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }
                  }}
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 16,
                    tickRotation: 0,
                    format: value => formatNumber(value)
                  }}
                  colors={['#2563EB']}
                  pointSize={12}
                  pointColor="#ffffff"
                  pointBorderWidth={3}
                  pointBorderColor="#2563EB"
                  lineWidth={4}
                  useMesh={true}
                  curve="catmullRom"
                  enableGridX={false}
                  enableGridY={true}
                  gridYValues={6}
                  animate={true}
                  motionConfig="gentle"
                  theme={{
                    axis: {
                      ticks: {
                        text: {
                          fontSize: 14,
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
                    <div className="bg-white p-4 shadow-2xl rounded-xl border border-gray-200">
                      <div className="text-sm font-medium text-gray-600">{point.data.x}</div>
                      <div className="text-lg font-bold text-blue-600">{formatNumber(point.data.y)} followers</div>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Engagement Metrics Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Average Likes Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900">Average Likes per Post</h2>
                <p className="text-gray-600 mt-1">Monthly engagement performance</p>
              </div>
              <div className="p-6">
                <div style={{ height: '320px' }}>
                  <ResponsiveBar
                    data={likesBarData}
                    keys={['likes']}
                    indexBy="month"
                    margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
                    padding={0.4}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={['#EC4899']}
                    borderRadius={8}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 0,
                      tickPadding: 16,
                      tickRotation: 0,
                      format: value => {
                        const date = new Date(value + '-01');
                        return date.toLocaleDateString('en-US', { month: 'short' });
                      }
                    }}
                    axisLeft={{
                      tickSize: 0,
                      tickPadding: 16,
                      tickRotation: 0,
                      format: value => formatNumber(value)
                    }}
                    enableGridY={true}
                    gridYValues={5}
                    animate={true}
                    motionConfig="gentle"
                    theme={{
                      axis: {
                        ticks: {
                          text: {
                            fontSize: 13,
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
                    tooltip={({ id, value, indexValue }) => (
                      <div className="bg-white p-4 shadow-2xl rounded-xl border border-gray-200">
                        <div className="text-sm font-medium text-gray-600">{indexValue}</div>
                        <div className="text-lg font-bold text-pink-600">{formatNumber(value)} likes</div>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Engagement Rate Comparison */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900">Engagement Rate Benchmark</h2>
                <p className="text-gray-600 mt-1">Your performance vs. industry standards</p>
              </div>
              <div className="p-6">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Your Engagement Rate</span>
                    <span className="text-2xl font-bold text-purple-600">{profile.engagement_rate.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full relative"
                      style={{ width: `${Math.min((profile.engagement_rate / 6) * 100, 100)}%` }}
                    >
                      <div className="absolute -top-8 right-0 text-xs font-semibold text-purple-600">
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-red-800">Poor (0-1%)</p>
                      <p className="text-sm text-red-600">Needs improvement</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">0-1%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                    <div>
                      <p className="font-semibold text-yellow-800">Good (1-3%)</p>
                      <p className="text-sm text-yellow-600">You are here!</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-600">1-3%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-green-800">Excellent (3%+)</p>
                      <p className="text-sm text-green-600">Top performers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">3%+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthSection;