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

  return (
    <div className="space-y-8">
      {/* Audience Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6">Audience Demographics</h3>
        
        {/* Combined Gender and Age Distribution */}
        <div className="mb-8">
          <h4 className="text-xl font-bold mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Gender & Age Distribution
          </h4>
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gender Pie Chart */}
              <div>
                <h5 className="text-lg font-bold mb-4 text-center text-gray-800">Gender Distribution</h5>
                <div className="h-96">
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
                      fontSize: 15,
                      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                      tooltip: {
                        container: {
                          background: '#1F2937',
                          color: '#F9FAFB',
                          fontSize: '15px',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          border: 'none'
                        }
                      }
                    }}
                    tooltip={({ datum }) => (
                      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                        <div className="font-bold text-xl">{datum.label}</div>
                        <div className="text-blue-300 font-bold text-xl">{datum.value.toFixed(1)}%</div>
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Age Pie Chart */}
              <div>
                <h5 className="text-lg font-bold mb-4 text-center text-gray-800">Age Distribution</h5>
                <div className="h-96">
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
                      fontSize: 15,
                      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                      tooltip: {
                        container: {
                          background: '#1F2937',
                          color: '#F9FAFB',
                          fontSize: '15px',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          border: 'none'
                        }
                      }
                    }}
                    tooltip={({ datum }) => (
                      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                        <div className="font-bold text-xl">{datum.label}</div>
                        <div className="text-blue-300 font-bold text-xl">{datum.value.toFixed(1)}%</div>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Gender breakdown by age - Vertical Bar Chart */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h5 className="font-bold text-lg text-gray-800 mb-6 text-center">Gender Breakdown by Age</h5>
              <div className="h-96">
                <ResponsiveBar
                  data={prepareGenderAgeBarData()}
                  keys={['Male', 'Female']}
                  indexBy="ageRange"
                  margin={{ top: 50, right: 130, bottom: 50, left: 80 }}
                  padding={0.3}
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
                  label={d => `${d.value.toFixed(1)}%`}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#ffffff"
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
                    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                      <div className="font-bold text-xl mb-2">{indexValue} years</div>
                      <div className="font-bold text-lg">{id}</div>
                      <div className="text-blue-300 font-bold text-xl">{value.toFixed(1)}%</div>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Data - Countries, States, Cities */}
        <div className={`grid grid-cols-1 ${shouldShowStates() ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center group">
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

          {shouldShowStates() && (
            <div>
              <h4 className="text-lg font-medium mb-4 flex items-center group">
                <Building2 className="w-5 h-5 mr-2" />
                Top States
                <div className="relative ml-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                    ?
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      States/provinces with significant audience presence (≥10%)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {getFilteredStates().map((state, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-sm">{state.name}</span>
                    <span className="text-purple-600 font-semibold text-sm">{state.value?.toFixed(1) || '0.0'}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center group">
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
      </div>

      {/* Language & Ethnicity */}
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

      {/* Brand Affinity */}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {profile?.audience?.brand_affinity?.map((brand, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border hover:shadow-md transition-all">
              <div className="text-sm font-medium text-gray-800 mb-1">{brand.name}</div>
              <div className="text-xs text-purple-600 font-semibold">{((brand.value || 0) * 100).toFixed(3)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Quality & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Credibility Score</span>
                <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getCredibilityColor(profile?.audience?.credibility_score || 0)}`}>
                  {((profile?.audience?.credibility_score || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(profile?.audience?.credibility_score || 0) * 100}%` }}
                ></div>
              </div>
            </div>
            
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
                  Topics and categories your audience is most interested in
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profile?.audience?.interests?.map((interest, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700 text-sm">{interest.name}</span>
                <span className="font-medium text-sm">{interest.value?.toFixed(1) || '0.0'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credibility Score Band */}
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
        
        {/* Nivo Bar Chart */}
        <div className="h-96 w-full">
          <ResponsiveBar
            data={profile?.audience?.credibility_score_band?.map((band, index) => ({
              id: `${band.min || 0}-${band.max || 100}`,
              scoreRange: band.min ? `${band.min.toFixed(0)}-${band.max?.toFixed(0) || '100'}%` : `0-${band.max?.toFixed(0) || '100'}%`,
              profileCount: band.total_profile_count,
              isMedian: band.is_median === 'True',
              color: band.is_median === 'True' ? '#f97316' : '#3b82f6'
            })) || []}
            keys={['profileCount']}
            indexBy="scoreRange"
            margin={{ top: 50, right: 60, bottom: 80, left: 80 }}
            padding={0.15}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={({ data }) => data.color}
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
              }
            ]}
            fill={[
              {
                match: (d) => d.data.isMedian,
                id: 'gradientOrange'
              },
              {
                match: '*',
                id: 'gradientBlue'
              }
            ]}
            borderRadius={4}
            borderWidth={0}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: 'Credibility Score Range',
              legendPosition: 'middle',
              legendOffset: 60,
              format: (value) => value
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Number of Profiles',
              legendPosition: 'middle',
              legendOffset: -60,
              format: (value) => formatNumber(value)
            }}
            enableLabel={true}
            label={(d) => formatNumber(d.value)}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            labelFormat={(value) => formatNumber(value)}
            animate={true}
            motionConfig="gentle"
            theme={{
              background: 'transparent',
              text: {
                fontSize: 12,
                fill: '#374151',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
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
                    fontSize: 13,
                    fill: '#6b7280',
                    fontWeight: 500
                  }
                },
                ticks: {
                  line: {
                    stroke: '#e5e7eb',
                    strokeWidth: 1
                  },
                  text: {
                    fontSize: 11,
                    fill: '#6b7280'
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
            tooltip={({ id, value, data }) => (
              <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                <div className="font-semibold">Score Range: {data.scoreRange}</div>
                <div className="text-blue-300">Profiles: {formatNumber(value)}</div>
                {data.isMedian && (
                  <div className="text-orange-300 text-xs mt-1">📊 Median Range</div>
                )}
              </div>
            )}
            role="application"
            ariaLabel="Credibility score distribution chart"
          />
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-8 mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded"></div>
            <span className="text-gray-600">Regular Distribution</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-t from-orange-500 to-orange-600 rounded"></div>
            <span className="text-gray-600">Median Range</span>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">
              {profile?.audience?.credibility_score_band?.length || 0}
            </div>
            <div className="text-sm text-gray-600 font-medium">Score Bands</div>
          </div>
          <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(profile?.audience?.credibility_score_band?.reduce((sum, band) => sum + band.total_profile_count, 0) || 0)}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Profiles</div>
          </div>
          <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-600">
              {((profile?.audience?.credibility_score || 0) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 font-medium">User's Score</div>
          </div>
        </div>
      </div>

      {/* Follower Reachability */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {profile?.audience?.follower_reachability?.map((reach, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {reach.following_range === '-500' ? 'Under 500' :
                 reach.following_range === '1500-' ? 'Over 1500' :
                 reach.following_range} following
              </div>
              <div className="text-2xl font-bold text-emerald-600">{reach.value?.toFixed(1) || '0.0'}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${reach.value || 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Significant Followers */}
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
          {profile?.audience?.significant_followers?.map((follower, index) => (
            <div key={index} className="text-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
              <img
                src={follower.image_url}
                alt={follower.platform_username}
                className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48x48?text=User';
                }}
              />
              <div className="flex items-center justify-center mb-1">
                <div className="font-medium text-xs truncate max-w-20">@{follower?.platform_username}</div>
                {follower.is_verified && <Verified className="w-3 h-3 text-blue-500 ml-1 flex-shrink-0" />}
              </div>
              <div className="text-xs text-gray-500">{formatNumber(follower?.follower_count || 0)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Audience Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {profile?.audience?.countries?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Countries Represented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {profile?.audience?.languages?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Languages Spoken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {profile?.audience?.interests?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Interest Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatNumber(profile?.audience?.significant_followers?.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Notable Followers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceSection;