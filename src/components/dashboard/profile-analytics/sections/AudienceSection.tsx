// src/components/dashboard/profile-analytics/sections/AudienceSection.tsx
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
  MessageCircle
} from 'lucide-react';

interface GenderDistribution {
  gender: string;
  value: number;
}

interface AgeDistribution {
  gender: string;
  age_range: string;
  value: number;
}

interface Country {
  code: string;
  value: number;
}

interface City {
  name: string;
  value: number;
}

interface Language {
  code: string;
  value: number;
}

interface Ethnicity {
  name: string;
  value: number;
}

interface FollowerType {
  name: string;
  value: number;
}

interface Interest {
  name: string;
  value: number;
}

interface SignificantFollower {
  platform_username: string;
  image_url: string;
  follower_count: number;
  is_verified: boolean;
}

interface Audience {
  gender_distribution: GenderDistribution[];
  gender_age_distribution: AgeDistribution[];
  countries: Country[];
  cities: City[];
  languages: Language[];
  ethnicities: Ethnicity[];
  follower_types: FollowerType[];
  interests: Interest[];
  credibility_score: number;
  significant_followers_percentage: number;
  significant_followers: SignificantFollower[];
}

interface AudienceCommenters {
  countries?: Country[];
  credibility_score?: number;
}

interface AudienceLikers {
  countries?: Country[];
  credibility_score?: number;
}

interface AudienceCommenters {
  countries?: Country[];
  credibility_score?: number;
}

interface ProfileData {
  audience: Audience;
  audience_likers?: AudienceLikers;
  audience_commenters?: AudienceCommenters;
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
  return (
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
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.audience.gender_distribution.map((gender, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        gender.gender === 'MALE' ? 'bg-blue-500' : 
                        gender.gender === 'FEMALE' ? 'bg-pink-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="font-medium text-gray-700">{gender.gender}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-800">{gender.value.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        gender.gender === 'MALE' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                        gender.gender === 'FEMALE' ? 'bg-gradient-to-r from-pink-400 to-pink-600' : 'bg-gray-500'
                      }`}
                      style={{ width: `${gender.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Age Distribution</h4>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Age Range Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
                          {age.value.toFixed(1)}%
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-3">{age.age_range} years</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${colors[index]} transition-all duration-700`}
                            style={{ width: `${Math.min((age.value / Math.max(...profile.audience.gender_age_distribution.reduce((acc: any[], curr) => {
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
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                    </div>
                  );
                })}
            </div>

            {/* Gender breakdown by age */}
            <div className="border-t border-gray-200 pt-6">
              <h5 className="font-medium text-gray-700 mb-4">Gender Breakdown by Age</h5>
              <div className="space-y-3">
                {profile.audience.gender_age_distribution
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
                          style={{ width: `${(ageGender.value / 50) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm font-medium text-right">{ageGender.value.toFixed(1)}%</div>
                    </div>
                  ))}
              </div>
            </div>
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
                  <span className="font-medium">{getCountryName(country.code)}</span>
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
                <span className="text-gray-700">{getLanguageName(lang.code)}</span>
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
            Audience - Likers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top Countries (Likers)</h4>
              <div className="space-y-2">
                {profile.audience_likers.countries.slice(0, 6).map((country, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{getCountryName(country.code)}</span>
                    <span className="font-medium">{country.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Credibility Score (Likers)</h4>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {profile.audience_likers.credibility_score ? (profile.audience_likers.credibility_score * 100).toFixed(1) : 'N/A'}%
              </div>
              {profile.audience_likers.credibility_score && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${profile.audience_likers.credibility_score * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audience Commenters Analysis */}
      {profile.audience_commenters && profile.audience_commenters.countries && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Audience - Commenters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top Countries (Commenters)</h4>
              <div className="space-y-2">
                {profile.audience_commenters.countries.slice(0, 6).map((country, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{getCountryName(country.code)}</span>
                    <span className="font-medium">{country.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Credibility Score (Commenters)</h4>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {profile.audience_commenters.credibility_score ? (profile.audience_commenters.credibility_score * 100).toFixed(1) : 'N/A'}%
              </div>
              {profile.audience_commenters.credibility_score && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${profile.audience_commenters.credibility_score * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceSection;