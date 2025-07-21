// src/components/dashboard/profile-analytics/sections/AudienceSection.tsx
'use client';

import { 
  Users, 
  Flag,
  MapPin, 
  Languages,
  UserCheck,
  Star,
  Verified,
  Building2,
  TrendingUp,
  Shield,
  Award,
  Target,
  Eye
} from 'lucide-react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { Profile } from '@/types/insightiq/profile-analytics';

interface ProfileData {
  audience: Profile['audience'];
}

interface AudienceSectionProps {
  profile: ProfileData;
  formatNumber: (num: number) => string;
}

const AudienceSection: React.FC<AudienceSectionProps> = ({
  profile,
  formatNumber
}) => {
  // Country code to name mapping
  const countryNames: { [key: string]: string } = {
    'PK': 'Pakistan',
    'US': 'United States',
    'IN': 'India',
    'SA': 'Saudi Arabia',
    'GB': 'United Kingdom',
    'AE': 'United Arab Emirates',
    'BD': 'Bangladesh',
    'TR': 'Turkey',
    'CA': 'Canada',
    'AU': 'Australia',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'ES': 'Spain',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'ID': 'Indonesia',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'SG': 'Singapore',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'RU': 'Russia',
    'EG': 'Egypt',
    'NG': 'Nigeria',
    'ZA': 'South Africa',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru'
  };

  // Language code to name mapping
  const languageNames: { [key: string]: string } = {
    'en': 'English',
    'ar': 'Arabic',
    'de': 'German',
    'ur': 'Urdu',
    'ru': 'Russian',
    'es': 'Spanish',
    'fr': 'French',
    'pt': 'Portuguese',
    'it': 'Italian',
    'th': 'Thai',
    'id': 'Indonesian',
    'az': 'Azerbaijani',
    'he': 'Hebrew',
    'nl': 'Dutch',
    'tr': 'Turkish',
    'fa': 'Persian',
    'arz': 'Egyptian Arabic',
    'da': 'Danish',
    'sw': 'Swahili',
    'ckb': 'Central Kurdish',
    'pnb': 'Punjabi',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'vi': 'Vietnamese',
    'pl': 'Polish',
    'uk': 'Ukrainian',
    'sco': 'Scots',
    'fi': 'Finnish',
    'other': 'Other'
  };

  const getCountryName = (code: string) => countryNames[code] || code;
  const getLanguageName = (code: string) => languageNames[code] || code.toUpperCase();

  const getFollowerTypeColor = (type: string) => {
    switch (type) {
      case 'real': return 'bg-green-500';
      case 'mass_followers': return 'bg-yellow-500';
      case 'suspicious': return 'bg-red-500';
      case 'influencers': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getFollowerTypeLabel = (type: string) => {
    switch (type) {
      case 'real': return 'Real Followers';
      case 'mass_followers': return 'Mass Followers';
      case 'suspicious': return 'Suspicious';
      case 'influencers': return 'Influencers';
      default: return type.replace('_', ' ');
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Calculate percentage for audience interests
  const calculateInterestPercentages = () => {
    const interests = profile?.audience?.interests || [];
    const totalSum = interests.reduce((sum, interest) => sum + (interest.value || 0), 0);
    
    return interests.map(interest => ({
      ...interest,
      percentage: totalSum > 0 ? ((interest.value || 0) / totalSum) * 100 : 0
    }));
  };

  // Filter states with 10% or higher percentage
  const getFilteredStates = () => {
    return profile?.audience?.states?.filter(state => (state.value || 0) >= 10) || [];
  };

  const shouldShowStates = () => {
    return getFilteredStates().length > 0;
  };

  // Prepare data for charts
  const prepareGenderPieData = () => {
    return profile?.audience?.gender_distribution?.map(gender => ({
      id: gender.gender,
      label: gender.gender,
      value: gender.value,
      color: gender.gender === 'MALE' ? '#3B82F6' : '#EC4899'
    })) || [];
  };

  const prepareAgeData = () => {
    return profile?.audience?.gender_age_distribution ? profile.audience.gender_age_distribution
      .reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.age_range === curr.age_range);
        if (existing) {
          existing.value += curr.value;
        } else {
          acc.push({ age_range: curr.age_range, value: curr.value });
        }
        return acc;
      }, [])
      .sort((a, b) => {
        const ageOrder = ['13-17', '18-24', '25-34', '35-44', '45-64'];
        return ageOrder.indexOf(a.age_range) - ageOrder.indexOf(b.age_range);
      }) : [];
  };

  const prepareAgePieData = () => {
    const ageData = prepareAgeData();
    const colors = ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    
    return ageData.map((age, index) => ({
      id: age.age_range,
      label: `${age.age_range} years`,
      value: age.value,
      color: colors[index] || '#6B7280'
    }));
  };

  const prepareGenderAgeBarData = () => {
    if (!profile?.audience?.gender_age_distribution) return [];
    
    const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45-64'];
    
    return ageRanges.map(ageRange => {
      const maleData = profile.audience.gender_age_distribution.find(
        item => item.age_range === ageRange && item.gender === 'MALE'
      );
      const femaleData = profile.audience.gender_age_distribution.find(
        item => item.age_range === ageRange && item.gender === 'FEMALE'
      );
      
      return {
        ageRange,
        Male: maleData?.value || 0,
        Female: femaleData?.value || 0
      };
    });
  };

  // Helper function to determine if a score range contains the user's score
  const isUserScoreRange = (min: number | null, max: number | null, userScore: number) => {
    const userScorePercent = userScore * 100;
    if (min === null || min === undefined) {
      return userScorePercent <= (max ?? 100);
    }
    if (max === null || max === undefined) {
      return userScorePercent >= min;
    }
    return userScorePercent >= min && userScorePercent <= max;
  };

  // Prepare credibility score data with proper sorting (left to right)
  const prepareCredibilityScoreData = () => {
    if (!profile?.audience?.credibility_score_band) {
      console.log('No credibility score band data available');
      return [];
    }
    
    const userScore = profile?.audience?.credibility_score || 0;
    console.log('User credibility score:', userScore, 'as percentage:', userScore * 100);
    
    // Sort the data by minimum score to ensure left-to-right ordering
    const sortedData = profile.audience.credibility_score_band
      .map((band, index) => {
        const minScore = band.min ?? 0;
        const maxScore = band.max ?? 100;
        const isUserRange = isUserScoreRange(band.min, band.max, userScore);
        
        console.log(`Band ${index}: ${minScore}-${maxScore}, User in range: ${isUserRange}, Profile count: ${band.total_profile_count}`);
        
        return {
          id: `range-${index}`,
          scoreRange: minScore === 0 && band.min === null 
            ? `0-${maxScore.toFixed(0)}%` 
            : maxScore === 100 && band.max === null 
            ? `${minScore.toFixed(0)}%+` 
            : `${minScore.toFixed(0)}-${maxScore.toFixed(0)}%`,
          profileCount: band.total_profile_count,
          median: (band as any).is_median === 'True' || (band as any).is_median === true ? 1 : 0,
          userRange: isUserRange ? 1 : 0,
          minScore: minScore,
          maxScore: maxScore,
          sortOrder: minScore // Use minimum score for sorting
        };
      })
      .sort((a, b) => {
        // Sort by minimum score (ascending) to get left-to-right order
        if (a.sortOrder === b.sortOrder) {
          return a.maxScore - b.maxScore;
        }
        return a.sortOrder - b.sortOrder;
      });
    
    console.log('Sorted credibility data:', sortedData);
    return sortedData;
  };

  // NEW: Prepare pyramid data for follower reachability
  const preparePyramidData = () => {
    const reachabilityData = profile?.audience?.follower_reachability || [];
    
    // Sort data by following range (ascending order for pyramid)
    const sortedData = [...reachabilityData].sort((a, b) => {
      // Custom sort order for following ranges
      const order: { [key: string]: number } = {
        '-500': 1,
        '500-1000': 2,
        '1000-1500': 3,
        '1500-': 4
      };
      return (order[a.following_range] || 0) - (order[b.following_range] || 0);
    });

    return sortedData.map((item, index) => ({
      label: item.following_range === '-500' ? 'Under 500' :
             item.following_range === '1500-' ? 'Over 1500' :
             item.following_range,
      value: item.value || 0,
      level: index + 1,
      color: `hsl(${120 + (index * 60)}, 70%, ${60 - (index * 5)}%)` // Different shades
    }));
  };

  // NEW: Fixed Pyramid Chart with Proper Text Display
  const PyramidChart = () => {
    const pyramidData = preparePyramidData();
    
    // Define professional colors for pyramid levels
    const pyramidColors = [
      '#22C55E', // Green (smallest - top)
      '#EAB308', // Yellow
      '#F97316', // Orange  
      '#EF4444'  // Red (largest - bottom)
    ];

    // Sort data by value (ascending) so smallest is at top, largest at bottom
    const sortedData = [...pyramidData].sort((a, b) => a.value - b.value);

    return (
      <div className="w-full h-full py-4">
        {/* True Pyramid Chart */}
        <div className="flex flex-col items-center space-y-0.5 mb-6">
          {sortedData.map((level, index) => {
            // Calculate pyramid widths
            const baseWidth = 320; // Increased for better text visibility
            const topWidth = 120;   // Increased minimum width
            const totalLevels = sortedData.length;
            
            // Calculate width progression for pyramid shape
            const widthStep = (baseWidth - topWidth) / (totalLevels - 1);
            const currentWidth = topWidth + (index * widthStep);
            
            const height = 50; // Increased height for better text space
            
            return (
              <div 
                key={index}
                className="relative group transform transition-all duration-500 hover:scale-105 hover:z-10"
                style={{ 
                  animation: `pyramidSlideIn 0.8s ease-out ${index * 0.2}s both`,
                  width: `${currentWidth}px`,
                  height: `${height}px`
                }}
              >
                {/* Main Pyramid Section */}
                <div
                  className="relative w-full h-full cursor-pointer overflow-hidden"
                  style={{
                    backgroundColor: pyramidColors[index] || '#6B7280',
                    clipPath: index === 0 
                      ? 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)' // Top (trapezoid)
                      : index === sortedData.length - 1
                      ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' // Bottom (rectangle)
                      : `polygon(${15 - (index * 3)}% 0%, ${85 + (index * 3)}% 0%, 100% 100%, 0% 100%)`, // Progressive trapezoids
                    borderRadius: '8px',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                    transform: 'translateZ(0)', // Hardware acceleration
                    animation: `pyramidExpand 1s ease-out ${index * 0.2 + 0.4}s both`
                  }}
                >
                  {/* Animated Background Gradient */}
                  <div 
                    className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(255,255,255,0.4) 0%, 
                        rgba(255,255,255,0.1) 50%, 
                        rgba(0,0,0,0.1) 100%)`,
                      clipPath: 'inherit'
                    }}
                  ></div>
                  
                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{
                      background: `radial-gradient(circle at center, 
                        rgba(255,255,255,0.3) 0%, 
                        rgba(255,255,255,0.1) 50%, 
                        transparent 100%)`,
                      clipPath: 'inherit',
                      filter: 'blur(1px)'
                    }}
                  ></div>
                  
                  {/* Text Content - Properly Positioned */}
                  <div className="absolute inset-0 flex items-center justify-center px-4 z-20">
                    <div className="text-center w-full">
                      {/* Label */}
                      <div 
                        className="text-white font-bold drop-shadow-lg mb-1"
                        style={{ 
                          fontSize: currentWidth > 200 ? '14px' : '12px',
                          animation: `textFadeIn 1s ease-out ${index * 0.2 + 0.8}s both`,
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        {level.label}
                      </div>
                      
                      {/* Percentage */}
                      <div 
                        className="text-white font-black drop-shadow-lg"
                        style={{ 
                          fontSize: currentWidth > 200 ? '18px' : '16px',
                          animation: `textFadeIn 1s ease-out ${index * 0.2 + 1}s both`,
                          textShadow: '0 2px 4px rgba(0,0,0,0.7)'
                        }}
                      >
                        {level.value.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Shine Effect */}
                  <div 
                    className="absolute inset-0 pointer-events-none group-hover:animate-pulse"
                    style={{
                      background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)',
                      clipPath: 'inherit',
                      transform: 'translateX(-100%)',
                      animation: `shineMove 3s ease-in-out ${index * 0.5 + 2}s infinite`
                    }}
                  ></div>
                  
                  {/* Floating Particles Effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${20 + (i * 30)}%`,
                          top: `${30 + (i * 20)}%`,
                          animation: `floatUp 2s ease-out ${i * 0.3}s infinite`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Enhanced Hover Tooltip */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-30">
                  <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl border border-gray-700">
                    <div className="text-center">
                      <div className="font-bold text-yellow-300 mb-1">{level.value.toFixed(1)}% of audience</div>
                      <div className="text-xs text-gray-300">follows {level.label} accounts</div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                
                {/* Progress Ring Animation */}
                <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div 
                    className="w-full h-full border-2 border-white/50 rounded-lg"
                    style={{
                      clipPath: 'inherit',
                      animation: `ringPulse 2s ease-in-out infinite`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced Legend with Animation */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4">
            {sortedData.map((level, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-200 hover:shadow-md"
                style={{ 
                  animation: `legendSlideIn 0.6s ease-out ${index * 0.15 + 1.8}s both` 
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-md flex-shrink-0 group-hover:scale-125 transition-all duration-300 shadow-lg"
                    style={{ 
                      backgroundColor: pyramidColors[index] || '#6B7280',
                      boxShadow: `0 0 20px ${pyramidColors[index]}40`
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                    {level.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors duration-300">
                    {level.value.toFixed(1)}%
                  </span>
                  <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-500 transition-colors duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced CSS Animations */}
        <style jsx>{`
          @keyframes pyramidSlideIn {
            from {
              transform: translateY(-30px) scale(0.8);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes pyramidExpand {
            from {
              transform: scaleX(0.3) scaleY(0.1);
              transform-origin: bottom center;
            }
            to {
              transform: scaleX(1) scaleY(1);
              transform-origin: bottom center;
            }
          }
          
          @keyframes textFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shineMove {
            0% {
              transform: translateX(-100%) skewX(-15deg);
            }
            50% {
              transform: translateX(0%) skewX(-15deg);
            }
            100% {
              transform: translateX(100%) skewX(-15deg);
            }
          }
          
          @keyframes floatUp {
            0% {
              transform: translateY(0) scale(0);
              opacity: 1;
            }
            100% {
              transform: translateY(-20px) scale(1);
              opacity: 0;
            }
          }
          
          @keyframes ringPulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
            }
          }
          
          @keyframes legendSlideIn {
            from {
              transform: translateX(-20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Audience Summary - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Countries</p>
              <p className="text-2xl font-bold text-purple-600">{profile?.audience?.countries?.length || 0}</p>
              <p className="text-xs text-gray-500">represented</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Flag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Languages</p>
              <p className="text-2xl font-bold text-blue-600">{profile?.audience?.languages?.length || 0}</p>
              <p className="text-xs text-gray-500">spoken</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Languages className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Interests</p>
              <p className="text-2xl font-bold text-green-600">{profile?.audience?.interests?.length || 0}</p>
              <p className="text-xs text-gray-500">categories</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Notable Followers</p>
              <p className="text-2xl font-bold text-orange-600">{formatNumber(profile?.audience?.significant_followers?.length || 0)}</p>
              <p className="text-xs text-gray-500">influencers</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Credibility Score</p>
              <p className="text-2xl font-bold text-emerald-600">{((profile?.audience?.credibility_score || 0) * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-500">quality</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gender Distribution and Top Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gender Distribution
          </h4>
          <div className="h-80">
            <ResponsivePie
              data={prepareGenderPieData()}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.4}
              padAngle={3}
              cornerRadius={4}
              activeOuterRadiusOffset={12}
              colors={({ data }) => data.color}
              borderWidth={3}
              borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#374151"
              arcLinkLabelsThickness={3}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#FFFFFF"
              arcLinkLabel={(d) => `${d.id}: ${d.value.toFixed(1)}%`}
              arcLabel={(d) => `${d.value.toFixed(1)}%`}
              theme={{
                text: {
                  fontSize: 16,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                },
                tooltip: {
                  container: {
                    background: '#1F2937',
                    color: '#F9FAFB',
                    fontSize: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }
                }
              }}
              tooltip={({ datum }) => (
                <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-bold text-sm">{datum.label}</div>
                    <div className="text-blue-300 font-bold text-sm">{datum.value.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center group">
            <Flag className="w-5 h-5 mr-2" />
            Top Countries
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Countries where your audience is located, ranked by percentage
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profile?.audience?.countries?.map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">{getCountryName(country.code)}</span>
                <span className="text-purple-600 font-semibold">{country.value?.toFixed(1) || '0.0'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Age Distribution and Top Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Age Distribution
          </h4>
          <div className="h-80">
            <ResponsivePie
              data={prepareAgePieData()}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.4}
              padAngle={2}
              cornerRadius={4}
              activeOuterRadiusOffset={12}
              colors={({ data }) => data.color}
              borderWidth={3}
              borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#374151"
              arcLinkLabelsThickness={3}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#FFFFFF"
              arcLinkLabel={(d) => `${d.id}: ${d.value.toFixed(1)}%`}
              arcLabel={(d) => `${d.value.toFixed(1)}%`}
              theme={{
                text: {
                  fontSize: 16,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                },
                tooltip: {
                  container: {
                    background: '#1F2937',
                    color: '#F9FAFB',
                    fontSize: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }
                }
              }}
              tooltip={({ datum }) => (
                <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-bold text-sm">{datum.label}</div>
                    <div className="text-blue-300 font-bold text-sm">{datum.value.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center group">
            <MapPin className="w-5 h-5 mr-2" />
            Top Cities
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Cities with the highest concentration of your audience
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profile?.audience?.cities?.map((city, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-sm">{city.name}</span>
                <span className="text-purple-600 font-semibold text-sm">{city.value?.toFixed(1) || '0.0'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gender Breakdown by Age and Audience Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender breakdown by age - Vertical Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gender Breakdown by Age
          </h4>
          <div className="h-80">
            <ResponsiveBar
              data={prepareGenderAgeBarData()}
              keys={['Male', 'Female']}
              indexBy="ageRange"
              margin={{ top: 50, right: 130, bottom: 50, left: 80 }}
              padding={0.02}
              groupMode="grouped"
              innerPadding={3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#3B82F6', '#EC4899']}
              defs={[
                {
                  id: 'maleGradient',
                  type: 'linearGradient',
                  colors: [
                    { offset: 0, color: '#3B82F6' },
                    { offset: 100, color: '#1D4ED8' }
                  ]
                },
                {
                  id: 'femaleGradient',
                  type: 'linearGradient',
                  colors: [
                    { offset: 0, color: '#EC4899' },
                    { offset: 100, color: '#DB2777' }
                  ]
                }
              ]}
              fill={[
                {
                  match: {
                    id: 'Male'
                  },
                  id: 'maleGradient'
                },
                {
                  match: {
                    id: 'Female'
                  },
                  id: 'femaleGradient'
                }
              ]}
              borderRadius={4}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: 0,
                legend: 'Age Range',
                legendPosition: 'middle',
                legendOffset: 32
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 12,
                tickRotation: 0,
                legend: 'Percentage (%)',
                legendPosition: 'middle',
                legendOffset: -60,
                format: value => `${value}%`
              }}
              enableLabel={true}
              label={d => `${(d.value ?? 0).toFixed(1)}%`}
              labelSkipWidth={8}
              labelSkipHeight={8}
              labelTextColor="#ffffff"
              labelFormat={(value) => `${Number(value).toFixed(1)}%`}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 4,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              animate={true}
              motionConfig="gentle"
              theme={{
                background: 'transparent',
                text: {
                  fontSize: 14,
                  fill: '#374151',
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontWeight: 700
                },
                axis: {
                  domain: {
                    line: {
                      stroke: '#e5e7eb',
                      strokeWidth: 1
                    }
                  },
                  legend: {
                    text: {
                      fontSize: 15,
                      fill: '#6b7280',
                      fontWeight: 700
                    }
                  },
                  ticks: {
                    line: {
                      stroke: '#e5e7eb',
                      strokeWidth: 1
                    },
                    text: {
                      fontSize: 13,
                      fill: '#6b7280',
                      fontWeight: 700
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: '#f3f4f6',
                    strokeWidth: 1
                  }
                }
              }}
              tooltip={({ id, value, indexValue }) => (
                <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-bold text-sm">{indexValue} years - {id}</div>
                    <div className="text-blue-300 font-bold text-sm">{value.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Audience Quality - Removed Credibility Score */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <UserCheck className="w-5 h-5 mr-2" />
            Audience Quality
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Assessment of follower authenticity and engagement quality
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Follower Types</h4>
              <div className="space-y-3">
                {profile?.audience?.follower_types?.map((type, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{getFollowerTypeLabel(type.name)}</span>
                      <span className="font-medium">{type.value?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getFollowerTypeColor(type.name)}`}
                        style={{ width: `${type.value || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">Significant Followers</span>
                <span className="font-medium">{profile?.audience?.significant_followers_percentage?.toFixed(1) || '0.0'}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Affinity and Audience Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Affinity - Updated to match Audience Interests format */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Award className="w-5 h-5 mr-2" />
            Brand Affinity
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Brands and companies your audience shows interest in
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {profile?.audience?.brand_affinity?.map((brand, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700 text-sm">{brand.name}</span>
                <span className="font-medium text-sm">{((brand.value || 0) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Interests - Updated with percentage calculation */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Target className="w-5 h-5 mr-2" />
            Audience Interests
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Topics and categories your audience is most interested in (calculated as percentage of total)
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {calculateInterestPercentages().map((interest, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700 text-sm">{interest.name}</span>
                <span className="font-medium text-sm">{interest.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credibility Score Distribution and Follower Reachability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credibility Score Distribution - Fixed to display left to right with user score highlighting */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center group">
            <Shield className="w-5 h-5 mr-2" />
            Credibility Score Distribution
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  How your credibility score compares to other profiles
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          
          {/* Summary Stats moved above chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(profile?.audience?.credibility_score_band?.reduce((sum, band) => sum + band.total_profile_count, 0) || 0)}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Profiles</div>
            </div>
            <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-300 shadow-lg">
              <div className="text-2xl font-bold text-orange-600">
                {((profile?.audience?.credibility_score || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 font-medium flex items-center justify-center">
                <span className="mr-1">🎯</span>
                Your Score
              </div>
            </div>
          </div>
          
          {/* Enhanced Nivo Bar Chart with fixed left-to-right ordering */}
          <div className="h-64 w-full">
            <ResponsiveBar
              data={prepareCredibilityScoreData()}
              keys={['profileCount']}
              indexBy="scoreRange"
              margin={{ top: 20, right: 30, bottom: 70, left: 60 }}
              padding={0.15}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={({ data }) => {
                // Debug logging
                console.log('Bar data:', data, 'userRange:', data.userRange, 'median:', data.median);
                
                if (data.userRange === 1) {
                  console.log('Applying orange color for user range');
                  return '#f97316'; // Orange for user's range
                }
                if (data.median === 1) {
                  console.log('Applying purple color for median');
                  return '#8b5cf6'; // Purple for median
                }
                console.log('Applying blue color for regular');
                return '#3b82f6'; // Blue for regular
              }}
              defs={[
                {
                  id: 'gradientBlue',
                  type: 'linearGradient',
                  colors: [
                    { offset: 0, color: '#3b82f6' },
                    { offset: 100, color: '#1d4ed8' }
                  ]
                },
                {
                  id: 'gradientOrange',
                  type: 'linearGradient',
                  colors: [
                    { offset: 0, color: '#f97316' },
                    { offset: 100, color: '#ea580c' }
                  ]
                },
                {
                  id: 'gradientPurple',
                  type: 'linearGradient',
                  colors: [
                    { offset: 0, color: '#8b5cf6' },
                    { offset: 100, color: '#7c3aed' }
                  ]
                }
              ]}
              fill={[
                {
                  match: (d) => {
                    const isUserRange = (d.data as any).userRange === 1;
                    console.log('Fill match for user range:', isUserRange, d.data);
                    return isUserRange;
                  },
                  id: 'gradientOrange'
                },
                {
                  match: (d) => {
                    const isMedian = (d.data as any).median === 1;
                    console.log('Fill match for median:', isMedian, d.data);
                    return isMedian;
                  },
                  id: 'gradientPurple'
                },
                {
                  match: '*',
                  id: 'gradientBlue'
                }
              ]}
              borderRadius={4}
              borderWidth={1}
              borderColor={(bar) => {
                const isUserRange = (bar.data as any).userRange === 1;
                return isUserRange ? '#ea580c' : '#1e293b';
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: -35,
                legend: 'Credibility Score Range (Low → High)',
                legendPosition: 'middle',
                legendOffset: 55,
                format: (value) => value
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Profiles',
                legendPosition: 'middle',
                legendOffset: -50,
                format: (value) => formatNumber(Number(value))
              }}
              enableLabel={false}
              animate={true}
              motionConfig="gentle"
              theme={{
                background: 'transparent',
                text: {
                  fontSize: 11,
                  fill: '#374151',
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontWeight: 500
                },
                axis: {
                  domain: {
                    line: {
                      stroke: '#e5e7eb',
                      strokeWidth: 1
                    }
                  },
                  legend: {
                    text: {
                      fontSize: 12,
                      fill: '#6b7280',
                      fontWeight: 600
                    }
                  },
                  ticks: {
                    line: {
                      stroke: '#e5e7eb',
                      strokeWidth: 1
                    },
                    text: {
                      fontSize: 10,
                      fill: '#6b7280',
                      fontWeight: 500
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: '#f3f4f6',
                    strokeWidth: 1
                  }
                },
                tooltip: {
                  container: {
                    background: '#1f2937',
                    color: '#f9fafb',
                    fontSize: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }
                }
              }}
              tooltip={({ value, data }) => {
                console.log('Tooltip data:', data);
                return (
                  <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-sm">Range: {data.scoreRange}</div>
                      <div className="text-blue-300 text-sm">Profiles: {formatNumber(Number(value))}</div>
                    </div>
                    {data.userRange === 1 && (
                      <div className="text-orange-300 text-xs mt-2 font-bold text-center">🎯 YOUR SCORE RANGE</div>
                    )}
                    {data.median === 1 && data.userRange !== 1 && (
                      <div className="text-purple-300 text-xs mt-2 text-center">📊 Median Range</div>
                    )}
                  </div>
                );
              }}
              role="application"
              ariaLabel="Credibility score distribution chart showing score ranges from low to high"
            />
          </div>
          
          {/* Enhanced Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-600 rounded"></div>
              <span className="text-gray-600">Regular</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-t from-purple-500 to-purple-600 rounded"></div>
              <span className="text-gray-600">Median</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-t from-orange-500 to-orange-600 rounded border-2 border-orange-700"></div>
              <span className="text-gray-600 font-semibold">🎯 Your Score</span>
            </div>
          </div>
        </div>

        {/* NEW: Follower Reachability - Updated with Pyramid Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Eye className="w-5 h-5 mr-2" />
            Follower Reachability
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Distribution of followers by their own following count
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          
          {/* Compact Pyramid Chart Implementation */}
          <div className="h-80 w-full overflow-hidden">
            <PyramidChart />
          </div>
        </div>
      </div>

      {/* Audience Languages and Audience Ethnicity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Languages className="w-5 h-5 mr-2" />
            Audience Languages
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Primary languages spoken by your audience members
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profile?.audience?.languages?.map((lang, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700">{getLanguageName(lang.code)}</span>
                <span className="font-medium">{lang.value?.toFixed(2) || '0.00'}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            Audience Ethnicity
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Ethnic background distribution of your audience
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-3">
            {profile?.audience?.ethnicities?.map((ethnicity, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{ethnicity.name}</span>
                  <span className="font-medium">{ethnicity.value?.toFixed(1) || '0.0'}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${ethnicity.value || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notable Followers - 6 items per row grid layout */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center group">
          <Star className="w-5 h-5 mr-2" />
          Notable Followers ({profile?.audience?.significant_followers_percentage?.toFixed(1) || '0.0'}% of total)
          <div className="relative ml-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
              ?
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                High-profile followers with significant reach and influence
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
          {profile?.audience?.significant_followers?.map((follower, index) => (
            <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-gray-50">
              <img
                src={follower.image_url}
                alt={follower.platform_username}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0 mb-2"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64x64?text=User';
                }}
              />
              <div className="text-center min-w-0 w-full">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="font-medium text-xs truncate max-w-20">@{follower?.platform_username}</span>
                  {follower.is_verified && <Verified className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-500">{formatNumber(follower?.follower_count || 0)} followers</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudienceSection;