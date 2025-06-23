// src/components/dashboard/profile-analytics/sections/AudienceLikersSection.tsx
'use client';

import { 
  Users, 
  Flag,
  MapPin, 
  Languages,
  UserCheck,
  Star,
  Heart,
  Verified,
  Building2,
  TrendingUp,
  Shield,
  Award,
  Target,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Profile } from '@/types/insightiq/profile-analytics';

interface ProfileData {
  audience_likers?: Profile['audience_likers'];
}

interface AudienceLikersSectionProps {
  profile: ProfileData;
  formatNumber: (num: number) => string;
}

const AudienceLikersSection: React.FC<AudienceLikersSectionProps> = ({
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

  const audienceLikers = profile?.audience_likers;

  // Check if likers data is available and has meaningful content
  const hasLikersData = audienceLikers && (
    (audienceLikers.countries && audienceLikers.countries.length > 0) ||
    (audienceLikers.gender_distribution && audienceLikers.gender_distribution.length > 0) ||
    audienceLikers.credibility_score !== undefined ||
    (audienceLikers.interests && audienceLikers.interests.length > 0)
  );

  if (!hasLikersData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No Likers Data Available</h3>
          <p className="text-gray-400 mt-2">
            Likers analytics data is not available for this profile. This could be because:
          </p>
          <div className="mt-4 text-left max-w-md mx-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Limited engagement:</strong> The profile may not have received enough likes for analysis.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Privacy settings:</strong> Likes data might be restricted or private.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Recent profile:</strong> Insufficient like history for meaningful analysis.
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
      {/* Likers Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Heart className="w-6 h-6 mr-2 text-blue-500" />
          Active Likers Demographics
        </h3>
        
        <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-6 mb-6">
          <div className="text-center">
            <Heart className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Active Likers</h4>
            <p className="text-gray-600 text-sm">
              Users who actively engage by liking posts and content
            </p>
          </div>
        </div>
        
        {/* Gender Distribution */}
        {audienceLikers.gender_distribution && (
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Gender Distribution
            </h4>
            <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {audienceLikers.gender_distribution.map((gender, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          gender.gender === 'MALE' ? 'bg-blue-500' : 
                          gender.gender === 'FEMALE' ? 'bg-pink-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="font-medium text-gray-700">{gender.gender}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-800">{gender.value?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          gender.gender === 'MALE' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                          gender.gender === 'FEMALE' ? 'bg-gradient-to-r from-pink-400 to-pink-600' : 'bg-gray-500'
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
        {audienceLikers.gender_age_distribution && (
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Age Distribution</h4>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Age Range Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {audienceLikers.gender_age_distribution
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
                      'from-green-400 to-green-600',
                      'from-yellow-400 to-yellow-600',
                      'from-red-400 to-red-600'
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
                              style={{ width: `${Math.min((age.value / Math.max(...audienceLikers.gender_age_distribution!.reduce((acc: any[], curr) => {
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
                  {audienceLikers.gender_age_distribution
                    .sort((a, b) => {
                      const ageOrder = ['13-17', '18-24', '25-34', '35-44', '45-64'];
                      return ageOrder.indexOf(a.age_range) - ageOrder.indexOf(b.age_range);
                    })
                    .map((ageGender, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium text-gray-600">{ageGender.age_range}</div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            ageGender.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
                          }`}></div>
                          <span className="text-xs text-gray-500 uppercase">{ageGender.gender}</span>
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              ageGender.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
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
              Top Countries
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceLikers?.countries?.map((country, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium">{getCountryName(country.code)}</span>
                  <span className="text-blue-600 font-semibold">{country.value?.toFixed(1) || '0.0'}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Top States
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceLikers?.states?.length > 0 ? audienceLikers.states.map((state, index) => (
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
              {audienceLikers?.cities?.map((city, index) => (
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
        {audienceLikers.languages && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Languages className="w-5 h-5 mr-2" />
              Likers Languages
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceLikers.languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">{getLanguageName(lang.code)}</span>
                  <span className="font-medium">{lang.value?.toFixed(2) || '0.00'}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {audienceLikers.ethnicities && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Likers Ethnicity</h3>
            <div className="space-y-3">
              {audienceLikers.ethnicities.map((ethnicity, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{ethnicity.name}</span>
                    <span className="font-medium">{ethnicity.value?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-pink-500 h-2 rounded-full transition-all duration-500"
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
      {audienceLikers.brand_affinity && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Brand Affinity (Likers)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {audienceLikers.brand_affinity.map((brand, index) => (
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
            Likers Quality
          </h3>
          <div className="space-y-6">
            {audienceLikers.credibility_score !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Credibility Score</span>
                  <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getCredibilityColor(audienceLikers.credibility_score)}`}>
                    {((audienceLikers.credibility_score || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(audienceLikers.credibility_score || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {audienceLikers.follower_types && (
              <div>
                <h4 className="font-medium mb-3">Follower Types</h4>
                <div className="space-y-3">
                  {audienceLikers.follower_types.map((type, index) => (
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
            
            {audienceLikers.significant_likers_percentage !== undefined && (
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Significant Likers</span>
                  <span className="font-medium">{audienceLikers.significant_likers_percentage?.toFixed(1) || '0.0'}%</span>
                </div>
              </div>
            )}

            {audienceLikers.likers_not_followers_percentage !== undefined && (
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likers Not Followers</span>
                  <span className="font-medium">{audienceLikers.likers_not_followers_percentage?.toFixed(1) || '0.0'}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {audienceLikers.interests && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Likers Interests
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceLikers.interests.map((interest, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700 text-sm">{interest.name}</span>
                  <span className="font-medium text-sm">{interest.value?.toFixed(1) || '0.0'}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Credibility Score Band */}
      {audienceLikers.credibility_score_band && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Credibility Score Distribution (Likers)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {audienceLikers.credibility_score_band.slice(0, 8).map((band, index) => (
              <div key={index} className={`p-4 rounded-lg border ${band.is_median === 'True' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200' : 'bg-gradient-to-br from-blue-50 to-pink-50'}`}>
                <div className="text-xs text-gray-600 mb-1">
                  {band.min ? `${band.min.toFixed(1)}%` : '0%'} - {band.max ? `${band.max.toFixed(1)}%` : '100%'}
                </div>
                <div className={`text-lg font-bold ${band.is_median === 'True' ? 'text-orange-600' : 'text-blue-600'}`}>
                  {formatNumber(band.total_profile_count)}
                </div>
                <div className="text-xs text-gray-500">
                  profiles {band.is_median === 'True' && <span className="text-orange-500 font-medium">(median)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Significant Likers */}
      {audienceLikers.significant_likers && audienceLikers.significant_likers.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Notable Likers ({audienceLikers.significant_likers_percentage?.toFixed(1)}% of total)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
            {audienceLikers.significant_likers.map((liker, index) => (
              <div key={index} className="text-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <img
                  src={liker.image_url}
                  alt={liker.platform_username}
                  className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/48x48?text=User';
                  }}
                />
                <div className="flex items-center justify-center mb-1">
                  <div className="font-medium text-xs truncate max-w-20">@{liker.platform_username}</div>
                  {liker.is_verified && <Verified className="w-3 h-3 text-blue-500 ml-1 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-500">{formatNumber(liker.follower_count)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Like Engagement Insights */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Like Engagement Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-700 font-medium">Engagement Type</div>
                <div className="text-lg font-bold text-blue-800">Likes</div>
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
                  {audienceLikers.credibility_score !== undefined 
                    ? (audienceLikers.credibility_score >= 0.8 ? 'High' :
                       audienceLikers.credibility_score >= 0.6 ? 'Medium' : 'Low')
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
                  {audienceLikers.countries ? `${audienceLikers.countries.length} Countries` : 'No Data'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for improving like engagement */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold text-gray-800 mb-2">💡 Tips to Increase Like Engagement</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Post visually appealing and high-quality content</li>
            <li>• Use trending hashtags relevant to your niche</li>
            <li>• Post at optimal times when your audience is most active</li>
            <li>• Create relatable content that resonates with your audience</li>
            <li>• Engage with your followers' content to build reciprocal relationships</li>
            <li>• Share behind-the-scenes and authentic moments</li>
          </ul>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Likers Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {audienceLikers?.countries?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Countries Represented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {audienceLikers?.languages?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Languages Spoken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {audienceLikers?.interests?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Interest Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatNumber(audienceLikers?.significant_likers?.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Notable Likers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceLikersSection;