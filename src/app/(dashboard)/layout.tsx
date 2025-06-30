// src/app/(dashboard)/layout.tsx - CLEAN VERSION
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal';
import ClientOnly from '@/components/ClientOnly';

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
    loadAuthFromStorage,
    getUserType,
    getPrimaryRole
  } = useAuth();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const maxRetries = 3;

  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  useEffect(() => {
    if (!isInitialized) return;

    const checkAuth = async () => {
      if (!isLoading && !isAuthenticated) {
        const hasStoredToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const hasStoredUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        
        if (hasStoredToken && hasStoredUser && retryCount < maxRetries) {
          loadAuthFromStorage();
          setRetryCount(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, 500));
          return;
        }
        
        if (retryCount >= maxRetries || !hasStoredToken || !hasStoredUser) {
          router.push('/login');
          return;
        }
      }

      if (!isLoading && isAuthenticated && user && !user.user_type) {
        try {
          await refreshUserSession();
        } catch (error) {
          router.push('/login');
        }
      }
    };

    checkAuth();
  }, [isInitialized, isLoading, isAuthenticated, user, router, loadAuthFromStorage, refreshUserSession, retryCount]);
  
  if (!isInitialized || isLoading || (retryCount > 0 && retryCount < maxRetries && !isAuthenticated)) {
    return (
      <ClientOnly fallback={<LoadingSpinner message="Loading..." />}>
        <LoadingSpinner message={
          retryCount > 0 
            ? `Syncing authentication... (${retryCount}/${maxRetries})` 
            : "Checking authentication..."
        } />
      </ClientOnly>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (!user?.user_type) {
    return (
      <ClientOnly>
        <SessionExpiredModal />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly fallback={<LoadingSpinner message="Loading dashboard..." />}>
      <DashboardContent 
        user={user}
        platform={platform}
        company={company}
        influencer={influencer}
        getUserType={getUserType}
        getPrimaryRole={getPrimaryRole}
      />
    </ClientOnly>
  );
}

function DashboardContent({ 
  user, 
  platform, 
  company, 
  influencer, 
  getUserType, 
  getPrimaryRole 
}: {
  user: any;
  platform: ReactNode;
  company: ReactNode;
  influencer: ReactNode;
  getUserType: () => any;
  getPrimaryRole: () => any;
}) {
  const userType = getUserType();
  
  let content;
  
  if (userType === 'platform') {
    content = platform;
  } else if (userType === 'company') {
    content = company;
  } else if (userType === 'influencer') {
    content = influencer;
  } else {
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