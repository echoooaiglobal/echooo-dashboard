// src/app/(dashboard)/layout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal'; // We'll create this component

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
  const { isLoading, isAuthenticated, user, refreshUserSession } = useAuth();
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
  
 
  if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard Layout:', {
        userType: user.user_type,
        hasPlatformSlot: !!platform,
        hasCompanySlot: !!company,
        hasInfluencerSlot: !!influencer,
      });
  }
  
  // The content to display based on user type
  let content;
  
  if (user.user_type === 'platform') {
    content = platform;
  } else if (user.user_type === 'company') {
    content = company;
  } else if (user.user_type === 'influencer') {
    content = influencer;
  } else {
    // This should almost never happen now with our improved checks
    content = <SessionExpiredModal />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="w-full max-w-[100vw] overflow-hidden">
        <div className="w-[95%] mx-auto py-3 overflow-hidden">
          {content}
        </div>
      </div>
    </div>
  );
}