// src/app/profile-analytics-report/[platformAccountId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InfluencerProfileReport from '@/components/dashboard/profile-analytics/InfluencerProfileReport';

// Define the type locally to avoid import issues
interface InsightIQProfileAnalyticsResponse {
  profile?: any;
  pricing?: any;
  price_explanations?: any;
  analytics_count?: number;
  [key: string]: any;
}

interface PageProps {
  params: {
    platformAccountId: string;
  };
}

export default function PublicReportPage({ params }: PageProps) {
  const { platformAccountId } = params;
  
  const [analyticsData, setAnalyticsData] = useState<InsightIQProfileAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicAnalytics = async () => {
      if (!platformAccountId) {
        setError('Platform Account ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching public analytics for:', platformAccountId);

        // Call the public API endpoint
        const response = await fetch(`/api/v0/profile-analytics/public/${platformAccountId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Public API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Public API error response:', errorData);
          
          if (response.status === 404) {
            throw new Error('Profile analytics not found');
          }
          throw new Error(errorData.detail || `Failed to load profile analytics: ${response.status}`);
        }

        const data = await response.json();
        console.log('Public analytics data received:', data);
        console.log('Profile data:', data.profile ? 'Found' : 'Missing');
        console.log('Analytics count:', data.analytics_count);
        
        // Validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received');
        }

        // Check if we have the expected profile data
        if (!data.profile && !data.analytics_count) {
          console.warn('Data structure seems incomplete:', data);
          throw new Error('Incomplete profile data received');
        }
        
        setAnalyticsData(data);
        console.log('Analytics data set successfully');
        
      } catch (err) {
        console.error('Error fetching public analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicAnalytics();
  }, [platformAccountId]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('State update - Loading:', loading, 'Error:', error, 'Data:', analyticsData ? 'Available' : 'None');
  }, [loading, error, analyticsData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Profile Analytics</h2>
            <p className="text-gray-500">Please wait while we fetch the report...</p>
            <p className="text-sm text-gray-400 mt-2">Platform ID: {platformAccountId}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Report</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-sm text-gray-500 mb-4">
              Platform ID: {platformAccountId}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Data validation check
  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h2>
            <p className="text-gray-600 mb-4">Analytics data was not loaded properly</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the report
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with branding */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Profile Analytics Report</h1>
                <p className="text-sm text-gray-500">Public View</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Public Report
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug info in development */}
      {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-blue-600">
              Debug: Profile data {analyticsData?.profile ? '✓' : '✗'} | 
              Analytics count: {analyticsData?.analytics_count || 'N/A'} | 
              Platform ID: {platformAccountId}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        <InfluencerProfileReport
          analyticsData={analyticsData}
          platformAccountId={platformAccountId}
          platformId={null}
          // Note: No refresh functionality for public view
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              This is a public view of the profile analytics report. 
              Data is provided for informational purposes only.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Report generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}