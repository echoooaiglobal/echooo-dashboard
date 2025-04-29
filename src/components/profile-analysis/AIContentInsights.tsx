// src/components/profile-analysis/AIContentInsights.tsx
'use client';

import { useMemo } from 'react';
import { 
  BarChart3, 
  Award, 
  ThumbsUp, 
  AlertCircle, 
  Sparkles, 
  Lightbulb,
  Users,
  ClipboardList,
  ClipboardCheck,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { InstagramUserDetails } from '@/types/instagram';
import PerformanceCategory from './PerformanceCategory';
import MetricsComparisonChart from './MetricsComparisonChart';
import EmotionalTriggerChart from './EmotionalTriggerChart';
import DemographicDistribution from './DemographicDistribution';
import AgeDistributionComparison from './AgeDistributionComparison';

interface AIContentInsightsProps {
  openaiAnalysis: any;
  profile: InstagramUserDetails;
}

export default function AIContentInsights({ 
  openaiAnalysis,
}: AIContentInsightsProps) {
  // Parse the OpenAI analysis data
  const analysisData = useMemo(() => {
    if (!openaiAnalysis?.analysis) return null;
    
    try {
      const jsonMatch = openaiAnalysis.analysis.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      return null;
    } catch (error) {
      console.error("Error parsing analysis data:", error);
      return null;
    }
  }, [openaiAnalysis]);
  
  if (!analysisData) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-700">No AI analysis data available. Run the analysis to see insights.</p>
      </div>
    );
  }
  
  // Prepare data for graphs
  const performanceComparisonData = [
    {
      name: 'Top Performing',
      color: 'bg-green-500',
      metrics: analysisData.top_performing_summary?.quantitative || {}
    },
    {
      name: 'Average Performing',
      color: 'bg-blue-500',
      metrics: analysisData.average_performing_summary?.quantitative || {}
    },
    {
      name: 'Least Performing',
      color: 'bg-orange-500',
      metrics: analysisData.least_performing_summary?.quantitative || {}
    }
  ];

  // console.log('FFFFFF', analysisData)
  const demoData = {
    top: { child: 20, teen: 30, adult: 50 },
    average: { child: 15, senior: 10, adult: 75 },
    least: { teen: 40, adult: 60 }
  };
  return (
    <div className="space-y-8">
      {/* Performance Categories */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Award className="mr-2 w-5 h-5 text-indigo-600" />
          Performance Analysis Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Performing */}
          <PerformanceCategory 
            title="Top Performing"
            variant="success"
            data={analysisData?.top_performing_summary}
            icon={<ThumbsUp className="w-4 h-4 mr-2" />}
          />
          
          {/* Average Performing */}
          <PerformanceCategory 
            title="Average Performing"
            variant="info"
            data={analysisData?.average_performing_summary}
            icon={<BarChart3 className="w-4 h-4 mr-2" />}
          />
          
          {/* Least Performing */}
          <PerformanceCategory 
            title="Least Performing"
            variant="warning"
            data={analysisData?.least_performing_summary}
            icon={<AlertCircle className="w-4 h-4 mr-2" />}
          />
        </div>
      </div>
      
      {/* Demographics & Distribution Analysis */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="mr-2 w-5 h-5 text-violet-600" />
          Demographics & Distribution Analysis
        </h3>
        
        {/* Gender Distribution */}
        <div className="mb-8">
          <h4 className="text-md font-medium mb-4">Gender Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DemographicDistribution
              title="Top Performing"
              data={analysisData?.top_performing_summary?.quantitative?.character_gender_distribution}
              colors={['#3b82f6', '#ec4899']}
            />
            <DemographicDistribution
              title="Average Performing"
              data={analysisData?.average_performing_summary?.quantitative?.character_gender_distribution}
              colors={['#3b82f6', '#ec4899']}
            />
            <DemographicDistribution
              title="Least Performing"
              data={analysisData?.least_performing_summary?.quantitative?.character_gender_distribution}
              colors={['#3b82f6', '#ec4899']}
            />
          </div>
        </div>
        
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Distribution Comparison */}
            <AgeDistributionComparison
              topPerforming={analysisData?.top_performing_summary?.quantitative?.character_age_distribution || {}}
              averagePerforming={analysisData?.average_performing_summary?.quantitative?.character_age_distribution || {}}
              leastPerforming={analysisData?.least_performing_summary?.quantitative?.character_age_distribution || {}}
            />

          {/* Ethnicity Distribution Comparison */}
            <AgeDistributionComparison
              topPerforming={analysisData?.top_performing_summary?.quantitative?.character_ethnicity_distribution || {}}
              averagePerforming={analysisData?.average_performing_summary?.quantitative?.character_ethnicity_distribution || {}}
              leastPerforming={analysisData?.least_performing_summary?.quantitative?.character_ethnicity_distribution || {}}
            />
        </div>
        
        {/* Screen Time Distribution */}
        <div className="mb-8">
          <h4 className="text-md font-medium mb-4">Screen Time Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DemographicDistribution
              title="Top Performing"
              data={analysisData?.top_performing_summary?.quantitative?.screen_time_percentages}
              colors={['#0ea5e9', '#f97316']}
            />
            <DemographicDistribution
              title="Average Performing"
              data={analysisData?.average_performing_summary?.quantitative?.screen_time_percentages}
              colors={['#0ea5e9', '#f97316']}
            />
            <DemographicDistribution
              title="Least Performing"
              data={analysisData?.least_performing_summary?.quantitative?.screen_time_percentages}
              colors={['#0ea5e9', '#f97316']}
            />
          </div>
        </div>
        
        {/* Lighting Styles */}
        <div className="mb-8">
          <h4 className="text-md font-medium mb-4">Lighting Styles</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DemographicDistribution
              title="Top Performing"
              data={analysisData?.top_performing_summary?.quantitative?.lighting_styles}
              colors={['#facc15', '#6b7280']}
            />
            <DemographicDistribution
              title="Average Performing"
              data={analysisData?.average_performing_summary?.quantitative?.lighting_styles}
              colors={['#facc15', '#6b7280']}
            />
            <DemographicDistribution
              title="Least Performing"
              data={analysisData?.least_performing_summary?.quantitative?.lighting_styles}
              colors={['#facc15', '#6b7280']}
            />
          </div>
        </div>
      </div>
    
      {/* Content Metrics Comparison------------------------------------------------------------ */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 w-5 h-5 text-purple-600" />
          Content Metrics Comparison
        </h3>
        
        {/* Visualization Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Audio Clarity Percentage */}
          <MetricsComparisonChart
            title="Audio Clarity Percentage"
            categories={performanceComparisonData.map(item => ({
              name: item.name,
              color: item.color,
              value: item.metrics?.audio_clarity,
              percentage: true
            }))}
          />
          {/* Voiceover Percentage */}
          <MetricsComparisonChart
            title="Voiceover Percentage"
            categories={performanceComparisonData.map(item => ({
              name: item.name,
              color: item.color,
              value: item.metrics?.voiceover_percentage,
              percentage: true
            }))}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Top Performing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">Average Performing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Least Performing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Scene Count (Avg)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.top_performing_summary?.quantitative?.scene_counts?.average || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.average_performing_summary?.quantitative?.scene_counts?.average || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.least_performing_summary?.quantitative?.scene_counts?.average || 'N/A'}
                </td>
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Scene Duration Range</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.top_performing_summary?.quantitative?.scene_durations?.min || 'N/A'} - {analysisData?.top_performing_summary?.quantitative?.scene_durations?.max || 'N/A'}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.average_performing_summary?.quantitative?.scene_durations?.min || 'N/A'} - {analysisData?.average_performing_summary?.quantitative?.scene_durations?.max || 'N/A'}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.least_performing_summary?.quantitative?.scene_durations?.min || 'N/A'} - {analysisData?.least_performing_summary?.quantitative?.scene_durations?.max || 'N/A'}s
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Audio Clarity</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.top_performing_summary?.quantitative?.audio_clarity || 'N/A'}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.average_performing_summary?.quantitative?.audio_clarity || 'N/A'}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.least_performing_summary?.quantitative?.audio_clarity || 'N/A'}%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Voiceover Percentage</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.top_performing_summary?.quantitative?.voiceover_percentage || 'N/A'}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.average_performing_summary?.quantitative?.voiceover_percentage || 'N/A'}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.least_performing_summary?.quantitative?.voiceover_percentage || 'N/A'}%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Special Effects Usage</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.top_performing_summary?.quantitative?.special_effects_usage || '0'}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.average_performing_summary?.quantitative?.special_effects_usage || '0'}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.least_performing_summary?.quantitative?.special_effects_usage || '0'}%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Color Palette</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.top_performing_summary?.quantitative?.color_palettes ? 
                    Object.entries(analysisData.top_performing_summary.quantitative.color_palettes)
                      .map(([key, value]) => `${key}: ${value}%`)
                      .join(', ') 
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.average_performing_summary?.quantitative?.color_palettes ? 
                    Object.entries(analysisData.average_performing_summary.quantitative.color_palettes)
                      .map(([key, value]) => `${key}: ${value}%`)
                      .join(', ') 
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.least_performing_summary?.quantitative?.color_palettes ? 
                    Object.entries(analysisData.least_performing_summary.quantitative.color_palettes)
                      .map(([key, value]) => `${key}: ${value}%`)
                      .join(', ') 
                    : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">CTA Frequency</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.top_performing_summary?.quantitative?.cta_frequency?.average ?? 'N/A'}
                  {analysisData?.top_performing_summary?.quantitative?.cta_frequency?.timestamps && 
                    ` (${analysisData.top_performing_summary.quantitative.cta_frequency.timestamps.join(', ')})`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.average_performing_summary?.quantitative?.cta_frequency?.average ?? 'N/A'}
                  {analysisData?.average_performing_summary?.quantitative?.cta_frequency?.timestamps && 
                    ` (${analysisData.average_performing_summary.quantitative.cta_frequency.timestamps.join(', ')})`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysisData?.least_performing_summary?.quantitative?.cta_frequency?.average ?? 'N/A'}
                  {analysisData?.least_performing_summary?.quantitative?.cta_frequency?.timestamps && 
                    ` (${analysisData.least_performing_summary.quantitative.cta_frequency.timestamps.join(', ')})`}
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>
      </div>
    
      
      {/* Emotional & Engagement Triggers */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Sparkles className="mr-2 w-5 h-5 text-yellow-600" />
          Emotional & Engagement Triggers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Top Performing Emotional Triggers */}
          <EmotionalTriggerChart 
            title="Top Performing" 
            colorClass="text-green-600"
            triggers={analysisData?.top_performing_summary?.quantitative?.emotional_triggers} 
          />
          
          {/* Average Performing Emotional Triggers */}
          <EmotionalTriggerChart 
            title="Average Performing" 
            colorClass="text-blue-600"
            triggers={analysisData?.average_performing_summary?.quantitative?.emotional_triggers} 
          />
          
          {/* Least Performing Emotional Triggers */}
          <EmotionalTriggerChart 
            title="Least Performing" 
            colorClass="text-orange-600"
            triggers={analysisData?.least_performing_summary?.quantitative?.emotional_triggers} 
          />
        </div>
        
        {/* Engagement Hooks for all three categories */}
      </div>
      
      {/* Timing & Pacing Analysis */}
      
      
      {/* Content Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 p-2 rounded-lg mr-4">
              <Lightbulb className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-800">Content Improvement Recommendations</h3>
              <p className="text-purple-600">Expert suggestions to enhance your content performance</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-50">
            <div className="mb-5 flex items-start">
              <div className="bg-purple-50 p-3 rounded-lg mr-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">Key Strategy</h4>
                <p className="text-purple-700 font-medium">
                  {analysisData?.overall_recommendations?.strategy || 'Focus on quality content improvements'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <ClipboardCheck className="w-5 h-5 text-purple-500 mr-2" />
                Actionable Recommendations
              </h4>
              
              {analysisData?.overall_recommendations?.specific_suggestions?.map((recommendation: string, index: number) => (
                <div 
                  key={index} 
                  className="flex items-start p-4 hover:bg-purple-50 rounded-lg transition-all duration-200"
                >
                  <div className="bg-purple-100 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="text-sm font-bold text-purple-700 w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium leading-relaxed">
                      {recommendation}
                    </p>
                    <div className="mt-2 flex space-x-3">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        Priority {index + 1}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        Estimated impact: High
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-300 ml-2" />
                </div>
              ))}
            </div>
            
            {(!analysisData?.overall_recommendations?.specific_suggestions || 
              analysisData.overall_recommendations.specific_suggestions.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p>No specific recommendations available yet</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center mx-auto">
              <Rocket className="w-5 h-5 mr-2" />
                How to Implement These Changes?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}