// src/components/profile-analysis/ProfileDetails.tsx
'use client';

import { ArrowLeft, BarChart3 } from 'lucide-react';
import { InstagramUserDetails } from '@/types/instagram';
import { formatNumber } from '@/utils/format';

interface ProfileDetailsProps {
  profile: InstagramUserDetails;
  onGenerateAnalysis: () => void;
  onBack: () => void;
}

export default function ProfileDetails({ 
  profile, 
  onGenerateAnalysis,
  onBack 
}: ProfileDetailsProps) {
  return (
    <div className="mt-6">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 w-4 h-4" />
        Back to search
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start">
        <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
          <img
            className="h-full w-full object-cover"
            src={profile.profile_pic_url_hd || profile.profile_pic_url || '/user/profile-placeholder.png'}
            alt={profile.username}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // prevent infinite loop
              target.src = '/user/profile-placeholder.png';
            }}
            loading="lazy"
          />
        </div>
        
        <div className="ml-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
            {profile.is_verified && (
              <span className="ml-2 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-1">@{profile.username}</p>
          
          {profile.category && (
            <p className="text-sm text-gray-500">{profile.category}</p>
          )}
        </div>
      </div>
        
        <div className="grid grid-cols-3 gap-4 my-6 text-center">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{formatNumber(profile.follower_count)}</div>
            <div className="text-gray-500 text-sm">Followers</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{formatNumber(profile.following_count)}</div>
            <div className="text-gray-500 text-sm">Following</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{formatNumber(profile.media_count)}</div>
            <div className="text-gray-500 text-sm">Posts</div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Bio</h3>
          <p className="text-gray-700 whitespace-pre-line">{profile.biography || 'No biography available'}</p>
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            onClick={onGenerateAnalysis}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <BarChart3 className="mr-2 w-5 h-5" />
            Generate Profile Analysis
          </button>
        </div>
      </div>
    </div>
  );
}