// src/app/(dashboard)/profile-analysis/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import ProfileSearch from '@/components/profile-analysis/ProfileSearch';
import ProfileDetails from '@/components/profile-analysis/ProfileDetails';
import { InstagramUser, InstagramUserDetails, InstagramPostsResponse } from '@/types/instagram';
import { searchProfiles, getProfileDetails } from '@/utils/instagram-api';
import { processVideos, generateTLAnalysis } from '@/utils/twelvelabs';
import { generateOpenAIAnalysis } from '@/utils/openai'; // Import our new utility function
import { delay } from '@/utils/ratelimit'

import { 
  saveAnalysisToLocal, 
  loadAnalysisFromLocal, 
  clearAnalysisFromLocal,
} from '@/utils/localStorageUtils';
import { VIDEO_ANALYSIS_PROMPT_V4 } from '@/lib/prompts';

interface VideoInfo {
  url: string;
  shortcode: string;
}


export default function ProfileAnalysisPage() {
  const [searchResults, setSearchResults] = useState<InstagramUser[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<InstagramUserDetails | null>(null);
  const [selectedProfilePosts, setSelectedProfilePosts] = useState<InstagramPostsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [openaiAnalysis, setOpenaiAnalysis] = useState<any>(null);
  const [isProcessingOpenAI, setIsProcessingOpenAI] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
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

  const handleProfileSelect = async (userId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    

    try {
      console.log(`Fetching profile details for userId: ${userId}`);
      setSelectedUserId(userId);
      // Use getProfileDetails function with includePosts=true
      const response = await getProfileDetails(userId);
      console.log("API Response:", response);
      
      if (!response || !response.profile) {
        throw new Error('Failed to retrieve profile information');
      }
      
      // Set the profile data
      setSelectedProfile(response.profile);
      
      // Check if posts data exists and set it
      if (response.posts) {
        console.log(`Retrieved ${response.posts.posts?.length || 0} posts`);
        setSelectedProfilePosts(response.posts);
      } else {
        console.log('No posts data available');
        setSelectedProfilePosts(null);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(`Failed to fetch profile details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setSelectedProfile(null);
      setSelectedProfilePosts(null);
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
  useEffect(() => {
    if(selectedUserId){
      const savedAnalysis = loadAnalysisFromLocal(`${selectedUserId}-analysisResults`);
      const savedOpenAI = loadAnalysisFromLocal(`${selectedUserId}-openaiAnalysis`);
      
      if (savedAnalysis) setAnalysisResults(savedAnalysis);
      if (savedOpenAI) setOpenaiAnalysis(savedOpenAI);
    }
  }, [selectedUserId]);
  
  // New function to process the analysis through OpenAI
  const processThroughOpenAI = async (results: any, userid: string) => {
   
    if (!results || results.length === 0 || !results[0]?.shortcode) return;
      console.log('results: ', results.length, results[0]?.shortcode, results)
    
    console.log('openai processing started...')
    setIsProcessingOpenAI(true);
    
    try {
      
      const openAIResponse = await generateOpenAIAnalysis(results);
      
      if (!openAIResponse.success) {
        throw new Error(openAIResponse.error || 'Failed to generate OpenAI analysis');
      }
      
      setOpenaiAnalysis(openAIResponse.data);
      saveAnalysisToLocal(`${userid}-openaiAnalysis`, openAIResponse.data);
      console.log('OpenAI analysis complete:', openAIResponse.data);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('OpenAI processing error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error during OpenAI analysis');
    } finally {
      setIsProcessingOpenAI(false);
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    console.log('generate analysis clicked')
    if (!selectedProfilePosts?.posts || !selectedProfile) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Create a Map for O(1) lookups by shortcode
      const videoPostsMap = new Map<string, any>();
      const videoPosts = selectedProfilePosts.posts.filter(post => post?.is_video);
  
      // Populate the Map
      videoPosts.forEach(post => {
        if (post.shortcode) {
          videoPostsMap.set(post.shortcode, post);
        }
      });
  
      if (videoPosts.length === 0) {
        throw new Error('No videos found to analyze');
      }
  
      console.log('videoPostsMap: ', videoPostsMap)
      
      // Process videos with TwelveLabs
      const processingResponse = await processVideos(
        selectedProfile.pk, 
        videoPosts.map(post => ({
          url: post.video_url,
          shortcode: post.shortcode
        })).filter(v => v.url && v.shortcode) as VideoInfo[]
      );
      
      if(!analysisResults){
    
        // Generate analysis for each processed video SEQUENTIALLY with rate limiting
        const generateAnalysisResults = [];
        
        // Base delay between requests (start with 2 seconds)
        const baseDelay = 2000; // 2 seconds
        // Maximum retry attempts
        const maxRetries = 3;
      
        for (const task of processingResponse.results) {
          // Get the complete post data from our Map
          const postData = videoPostsMap.get(task.shortcode);
          
          // Add rate limiting delay between API calls
          if (generateAnalysisResults.length > 0) {
            console.log(`Rate limiting: waiting ${baseDelay/1000} seconds before next API call...`);
            await delay(baseDelay);
          }
          
          // Implement retry logic with exponential backoff
          let analysisResponse = null;
          let retries = 0;
          let currentDelay = baseDelay;
          
          while (retries <= maxRetries) {
            try {
              analysisResponse = await generateTLAnalysis(
                task.videoId, 
                VIDEO_ANALYSIS_PROMPT_V4
              );
              console.log('shortcode: ', task.shortcode, 'analysisResponse: ', analysisResponse);
              // If successful, break out of retry loop
              break;
            } catch (error: any) {
              // Check specifically for 429 status code
              if (error?.status === 429 || error?.errordata?.status === 429 || 
                  (error?.message && error.message.includes('429')) ||
                  (error?.config?.status === 429)) {
                
                retries++;
                if (retries > maxRetries) {
                  throw new Error(`Rate limit exceeded after ${maxRetries} retries. Please try again later.`);
                }
                
                // Exponential backoff: double the delay on each retry
                currentDelay *= 2;
                console.log(`Rate limit hit (429), retry ${retries}/${maxRetries}. Waiting ${currentDelay/1000} seconds...`);
                await delay(currentDelay);
              } else {
                // If it's not a rate limit error, throw it immediately
                throw error;
              }
            }
          }
    
          generateAnalysisResults.push({
            id: analysisResponse?.data?.id,
            shortcode: task.shortcode,
            videoId: task.videoId,
            metrics: postData || null,
            analysis: analysisResponse?.data,
          });
        }
        
        setAnalysisResults({
          userId: selectedProfile.pk,
          indexId: processingResponse.indexId,
          videos: generateAnalysisResults
        }); 
    
        // Save data in local storage
        saveAnalysisToLocal(`${selectedProfile.pk}-analysisResults`, {
          userId: selectedProfile.pk,
          indexId: processingResponse.indexId,
          videos: generateAnalysisResults
        });

        console.log('Open AI 001')
        processThroughOpenAI(generateAnalysisResults, String(selectedProfile?.pk));
      }
      
      if(!openaiAnalysis){
        // Call OpenAI to analyze the results 
        console.log('Open AI 002')
        processThroughOpenAI(analysisResults?.videos, selectedUserId);
      }
      
      console.log('Analysis completed successfully: ', analysisResults);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error during analysis');
    } finally {
      setIsAnalyzing(false);
    }
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
          {/* <p className="text-sm mt-2">
            Make sure your API environment variables are set correctly in .env.local
          </p> */}
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
                onClick={() => handleProfileSelect(user.id)}
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
                        handleImageError(user.id);
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
      
      {isLoading && (
        <div className="mt-6 p-4 bg-gray-50 border rounded text-center">
          <div className="animate-pulse flex justify-center">
            <div className="h-6 w-6 bg-blue-600 rounded-full"></div>
            <div className="ml-4 text-gray-700">Loading...</div>
          </div>
        </div>  
      )}
      
      {selectedProfile && (
        <ProfileDetails 
          profile={selectedProfile}
          posts={selectedProfilePosts} 
          onGenerateAnalysis={handleGenerateAnalysis}
          isAnalyzing={isAnalyzing || isProcessingOpenAI}
          analysisResults={analysisResults}
          openaiAnalysis={openaiAnalysis}
          onBack={() => {
            setSelectedProfile(null);
            setSelectedProfilePosts(null);
            setAnalysisResults(null);
            setOpenaiAnalysis(null);
          }}
          onClear={() => {
            clearAnalysisFromLocal(`${selectedUserId}-analysisResults`);
            clearAnalysisFromLocal(`${selectedUserId}-openaiAnalysis`);
            setOpenaiAnalysis(null)
          }}          
          // onBack={() => {
          //   setSelectedProfile(null);
          //   setSelectedProfilePosts(null);
          //   setAnalysisResults(null);
          //   setOpenaiAnalysis(null);
          // }}
        />
      )}
    </div>
  );
}