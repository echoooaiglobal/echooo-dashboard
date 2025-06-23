// src/components/dashboard/profile-analytics/sections/AudienceCommentersSection.tsx
'use client';

import { 
  Users,
  Flag,
  MapPin,
  Languages,
  UserCheck,
  MessageCircle,
  AlertCircle,
  Building2,
  TrendingUp,
  Shield,
  Award,
  Target,
  Star,
  Verified
} from 'lucide-react';
import { Profile } from '@/types/insightiq/profile-analytics';

interface ProfileData {
  audience_commenters?: Profile['audience_commenters'];
}

interface AudienceCommentersSectionProps {
  profile: ProfileData;
  formatNumber: (num: number) => string;
}

const AudienceCommentersSection: React.FC<AudienceCommentersSectionProps> = ({
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

  const audienceCommenters = profile?.audience_commenters;

  // Check if commenters data is available and has meaningful content
  const hasCommentersData = audienceCommenters && (
    (audienceCommenters.countries && audienceCommenters.countries.length > 0) ||
    (audienceCommenters.gender_distribution && audienceCommenters.gender_distribution.length > 0) ||
    audienceCommenters.credibility_score !== undefined ||
    (audienceCommenters.interests && audienceCommenters.interests.length > 0)
  );

  if (!hasCommentersData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No Commenters Data Available</h3>
          <p className="text-gray-400 mt-2">
            Comments analytics data is not available for this profile. This could be because:
          </p>
          <div className="mt-4 text-left max-w-md mx-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Limited engagement:</strong> The profile may not have received enough comments for analysis.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Privacy settings:</strong> Comments data might be restricted or private.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Recent profile:</strong> Insufficient comment history for meaningful analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Commenters Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-blue-500" />
          Active Commenters Analytics
        </h3>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Active Commenters</h4>
            <p className="text-gray-600 text-sm">
              Users who actively engage through comments on posts
            </p>
          </div>
        </div>

        {/* Gender Distribution */}
        {audienceCommenters.gender_distribution && (
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Gender Distribution
            </h4>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {audienceCommenters.gender_distribution.map((gender, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          gender.gender === 'MALE' ? 'bg-blue-500' : 
                          gender.gender === 'FEMALE' ? 'bg-purple-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="font-medium text-gray-700">{gender.gender}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-800">{gender.value?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          gender.gender === 'MALE' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                          gender.gender === 'FEMALE' ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gray-500'
                        }`}
                        style={{ width: `${gender.value || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Age Distribution */}
        {audienceCommenters.gender_age_distribution && (
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Age Distribution</h4>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Age Range Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {audienceCommenters.gender_age_distribution
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
                  })
                  .map((age, index) => {
                    const colors = [
                      'from-purple-400 to-purple-600',
                      'from-blue-400 to-blue-600', 
                      'from-indigo-400 to-indigo-600',
                      'from-cyan-400 to-cyan-600',
                      'from-teal-400 to-teal-600'
                    ];
                    return (
                      <div key={index} className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 hover:shadow-lg transition-all duration-300 group">
                        <div className="text-center">
                          <div className={`text-2xl font-bold bg-gradient-to-r ${colors[index]} bg-clip-text text-transparent mb-2`}>
                            {age.value?.toFixed(1) || '0.0'}%
                          </div>
                          <div className="text-sm font-medium text-gray-700 mb-3">{age.age_range} years</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${colors[index]} transition-all duration-700`}
                              style={{ width: `${Math.min((age.value / Math.max(...audienceCommenters.gender_age_distribution!.reduce((acc: any[], curr) => {
                                const existing = acc.find(item => item.age_range === curr.age_range);
                                if (existing) {
                                  existing.value += curr.value;
                                } else {
                                  acc.push({ age_range: curr.age_range, value: curr.value });
                                }
                                return acc;
                              }, []).map(item => item.value))) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                      </div>
                    );
                  })}
              </div>

              {/* Gender breakdown by age */}
              <div className="border-t border-gray-200 pt-6">
                <h5 className="font-medium text-gray-700 mb-4">Gender Breakdown by Age</h5>
                <div className="space-y-3">
                  {audienceCommenters.gender_age_distribution
                    .sort((a, b) => {
                      const ageOrder = ['13-17', '18-24', '25-34', '35-44', '45-64'];
                      return ageOrder.indexOf(a.age_range) - ageOrder.indexOf(b.age_range);
                    })
                    .map((ageGender, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium text-gray-600">{ageGender.age_range}</div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            ageGender.gender === 'MALE' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="text-xs text-gray-500 uppercase">{ageGender.gender}</span>
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              ageGender.gender === 'MALE' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${((ageGender.value || 0) / 50) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm font-medium text-right">{ageGender.value?.toFixed(1) || '0.0'}%</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Geographic Data - Countries, States, Cities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Flag className="w-5 h-5 mr-2" />
              Top Countries (Commenters)
            </h4>
            <div className="space-y-3">
              {audienceCommenters?.countries?.slice(0, 8).map((country, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {country.code}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800">{getCountryName(country.code)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-600 font-bold text-lg">{country.value?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Countries Chart Visualization */}
            {audienceCommenters?.countries && audienceCommenters.countries.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-3">Geographic Distribution</h5>
                <div className="space-y-2">
                  {audienceCommenters.countries.slice(0, 5).map((country, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium text-gray-600 truncate">
                        {getCountryName(country.code)}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${(country.value / Math.max(...audienceCommenters.countries!.map(c => c.value))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm font-bold text-blue-600 text-right">
                        {country.value?.toFixed(1) || '0.0'}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Top States
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceCommenters?.states?.length > 0 ? audienceCommenters.states.map((state, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-sm">{state.name}</span>
                  <span className="text-blue-600 font-semibold text-sm">{state.value?.toFixed(1) || '0.0'}%</span>
                </div>
              )) : <div className="text-gray-500 text-sm">No state data available</div>}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Top Cities
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceCommenters?.cities?.map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-sm">{city.name}</span>
                  <span className="text-blue-600 font-semibold text-sm">{city.value?.toFixed(1) || '0.0'}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language & Ethnicity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {audienceCommenters.languages && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Languages className="w-5 h-5 mr-2" />
              Commenters Languages
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceCommenters.languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">{getLanguageName(lang.code)}</span>
                  <span className="font-medium">{lang.value?.toFixed(2) || '0.00'}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {audienceCommenters.ethnicities && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Commenters Ethnicity</h3>
            <div className="space-y-3">
              {audienceCommenters.ethnicities.map((ethnicity, index) => (
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
        )}
      </div>

      {/* Brand Affinity */}
      {audienceCommenters.brand_affinity && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Brand Affinity (Commenters)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {audienceCommenters.brand_affinity.map((brand, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border hover:shadow-md transition-all">
                <div className="text-sm font-medium text-gray-800 mb-1">{brand.name}</div>
                <div className="text-xs text-blue-600 font-semibold">{((brand.value || 0) * 100).toFixed(3)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Quality & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Commenters Quality
          </h3>
          
          {audienceCommenters.credibility_score !== undefined ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {((audienceCommenters.credibility_score || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-600 font-medium">Credibility Score</div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${(audienceCommenters.credibility_score || 0) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {audienceCommenters.credibility_score >= 0.8 ? 'Excellent' :
                     audienceCommenters.credibility_score >= 0.6 ? 'Good' :
                     audienceCommenters.credibility_score >= 0.4 ? 'Fair' : 'Needs Improvement'} 
                    commenter quality
                  </p>
                </div>
              </div>

              {/* Follower Types */}
              {audienceCommenters.follower_types && (
                <div>
                  <h4 className="font-medium mb-3">Follower Types</h4>
                  <div className="space-y-3">
                    {audienceCommenters.follower_types.map((type, index) => (
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
              )}

              {/* Significant Commenters Percentage */}
              {audienceCommenters.significant_commenters_percentage !== undefined && (
                <div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Significant Commenters</span>
                    <span className="font-medium">{audienceCommenters.significant_commenters_percentage?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Credibility score not available
                </p>
              </div>
            </div>
          )}

          {/* Additional Quality Metrics */}
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Countries</span>
                <span className="font-bold text-gray-800">
                  {audienceCommenters.countries ? audienceCommenters.countries.length : 0}
                </span>
              </div>
            </div>
            
            {audienceCommenters.countries && audienceCommenters.countries.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Top Country</span>
                  <span className="font-bold text-gray-800">
                    {getCountryName(audienceCommenters.countries[0].code)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {audienceCommenters.interests && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Commenters Interests
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceCommenters.interests.map((interest, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700 text-sm">{interest.name}</span>
                  <span className="font-medium text-sm">{interest.value?.toFixed(1) || '0.0'}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Significant Commenters */}
      {audienceCommenters.significant_commenters && audienceCommenters.significant_commenters.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Notable Commenters ({audienceCommenters.significant_commenters_percentage?.toFixed(1)}% of total)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
            {audienceCommenters.significant_commenters.map((commenter, index) => (
              <div key={index} className="text-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <img
                  src={commenter.image_url}
                  alt={commenter.platform_username}
                  className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/48x48?text=User';
                  }}
                />
                <div className="flex items-center justify-center mb-1">
                  <div className="font-medium text-xs truncate max-w-20">@{commenter.platform_username}</div>
                  {commenter.is_verified && <Verified className="w-3 h-3 text-blue-500 ml-1 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-500">{formatNumber(commenter.follower_count)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Insights */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comment Engagement Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-700 font-medium">Engagement Type</div>
                <div className="text-lg font-bold text-blue-800">Comments</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-700 font-medium">Quality Level</div>
                <div className="text-lg font-bold text-green-800">
                  {audienceCommenters.credibility_score !== undefined 
                    ? (audienceCommenters.credibility_score >= 0.8 ? 'High' :
                       audienceCommenters.credibility_score >= 0.6 ? 'Medium' : 'Low')
                    : 'Unknown'
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-purple-700 font-medium">Global Reach</div>
                <div className="text-lg font-bold text-purple-800">
                  {audienceCommenters.countries ? `${audienceCommenters.countries.length} Countries` : 'No Data'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for improving comment engagement */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold text-gray-800 mb-2">💡 Tips to Increase Comment Engagement</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ask open-ended questions in your captions</li>
            <li>• Respond promptly to comments to encourage more interaction</li>
            <li>• Create content that sparks conversation and debate</li>
            <li>• Use call-to-action phrases like "What do you think?" or "Share your experience"</li>
            <li>• Share behind-the-scenes content that invites commentary</li>
            <li>• Post controversial or trending topics (while staying respectful)</li>
          </ul>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Commenters Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {audienceCommenters?.countries?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Countries Represented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {audienceCommenters?.languages?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Languages Spoken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {audienceCommenters?.interests?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Interest Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600 mb-1">
              {formatNumber(audienceCommenters?.significant_commenters?.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Notable Commenters</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceCommentersSection;