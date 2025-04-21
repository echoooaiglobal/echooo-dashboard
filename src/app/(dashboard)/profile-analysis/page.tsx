// src/app/(dashboard)/profile-analysis/page.tsx
'use client';

import { useState, useCallback } from 'react';
import ProfileSearch from '@/components/profile-analysis/ProfileSearch';
import ProfileDetails from '@/components/profile-analysis/ProfileDetails';
import { InstagramUser, InstagramUserDetails } from '@/types/instagram';
import { searchProfiles, getProfileDetails } from '@/utils/instagram-api';
import Image from 'next/image';

export default function ProfileAnalysisPage() {
  const [searchResults, setSearchResults] = useState<InstagramUser[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<InstagramUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  // Use useCallback to prevent unnecessary re-renders
  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim() || keyword.length < 2) {
      setSearchResults(null);
      return;
    }

    if (isLoading) return; // Prevent multiple simultaneous searches
    
    setIsLoading(true);
    setError(null);
    setImgErrors(new Set()); // Reset image errors on new search
    
    try {
      const results = await searchProfiles(keyword);
      setSearchResults(results.users);
    } catch (err) {
      console.error("Search error:", err);
      setError('Failed to search profiles. Please ensure your API is configured correctly.');
      // Clear results to prevent stale data
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleProfileSelect = async (username: string, userId: string) => {
    if (isLoading) return; // Prevent actions while loading
    
    setIsLoading(true);
    setError(null);
    
    try {
      const details = await getProfileDetails(userId);
      setSelectedProfile(details.user);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError('Failed to fetch profile details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (userId: string) => {
    setImgErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.add(userId);
      return newErrors;
    });
  };

  const handleGenerateAnalysis = () => {
    // This will be implemented later as mentioned in your requirements
    console.log('Generate analysis for:', selectedProfile?.username);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Instagram Profile Analysis</h1>
      
      <ProfileSearch 
        onSearch={handleSearch} 
        isLoading={isLoading} 
      />
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
          <p className="font-semibold mb-1">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">
            Make sure your API environment variables are set correctly in .env.local
          </p>
        </div>
      )}
      
      {searchResults && searchResults.length > 0 && !selectedProfile && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="grid gap-4">
            {searchResults.map((user) => (
              <div 
                key={user.pk} 
                className="p-4 border rounded-lg flex items-center cursor-pointer hover:bg-gray-50 transition"
                onClick={() => handleProfileSelect(user.username, user.id)}
              >
                {/* Handle profile picture with fallback */}
                <div className="w-12 h-12 rounded-full mr-4 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {imgErrors.has(user.id) ? (
                    <span className="text-gray-400 font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.profile_pic_url || '/user/profile-placeholder.png'}
                        alt={user.username}
                        onError={(e) => {
                        (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                        }}
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{user.full_name}</h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                  {user.social_context && (
                    <p className="text-xs text-gray-500 mt-1">{user.social_context}</p>
                  )}
                </div>
                {user.is_verified && (
                  <span className="ml-2 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {searchResults && searchResults.length === 0 && !error && (
        <div className="mt-6 p-4 bg-gray-50 border rounded text-center">
          No profiles found matching your search.
        </div>
      )}
      
      {selectedProfile && (
        <ProfileDetails 
          profile={selectedProfile} 
          onGenerateAnalysis={handleGenerateAnalysis}
          onBack={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}