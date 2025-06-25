// src/app/(dashboard)/layout.tsx - Corrected with parallel routes support
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal';

// The props here come from Next.js parallel routes
export default function DashboardLayout({
  children,
  platform,
  company,
  influencer
}: {
  children: ReactNode;
  platform: ReactNode;
  company: ReactNode;
  influencer: ReactNode;
}) {
  const { 
    isLoading, 
    isAuthenticated, 
    user, 
    refreshUserSession,
    getUserType,
    getPrimaryRole
  } = useAuth();
  const router = useRouter();
  
  // Use an effect for navigation after render, not during render
  useEffect(() => {
    // Check authentication status after loading
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    
    // If authenticated but no valid user type, try refreshing the session
    if (!isLoading && isAuthenticated && user && !user.user_type) {
      refreshUserSession().catch(() => {
        // If refresh fails, redirect to login
        router.push('/login');
      });
    }
  }, [isLoading, isAuthenticated, user, router, refreshUserSession]);
  
  // Show loading spinner while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Don't render anything if not authenticated - just wait for redirect
  if (!isAuthenticated) {
    return null;
  }
  
  // Handle case where we're authenticated but user object is incomplete
  if (!user?.user_type) {
    return <SessionExpiredModal />;
  }

  // Get role information
  const userType = getUserType();
  const primaryRole = getPrimaryRole();

  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard Layout:', {
      userType,
      primaryRole,
      hasPlatformSlot: !!platform,
      hasCompanySlot: !!company,
      hasInfluencerSlot: !!influencer,
    });
  }
  
  // The content to display based on user type using parallel routes
  let content;
  
  if (userType === 'platform') {
    content = platform;
  } else if (userType === 'company') {
    content = company;
  } else if (userType === 'influencer') {
    content = influencer;
  } else {
    // This should almost never happen now with our improved checks
    content = <SessionExpiredModal />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-150 to-purple-100 overflow-x-hidden">
      <div className="w-full max-w-[100vw] overflow-hidden">
        <div className="w-[95%] mx-auto py-3 overflow-hidden">
          {content}
        </div>
      </div>
    </div>
  );
}