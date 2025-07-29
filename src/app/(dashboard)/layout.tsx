
// src/app/(dashboard)/layout.tsx - FIXED WITH PROPER MARGINS
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal';
import ClientOnly from '@/components/ClientOnly';
import Sidebar from '@/components/dashboard/Sidebar';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
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
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
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
  getPrimaryRole,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}: {
  user: any;
  platform: ReactNode;
  company: ReactNode;
  influencer: ReactNode;
  getUserType: () => any;
  getPrimaryRole: () => any;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
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
      {/* SIDEBAR */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* MAIN CONTENT AREA - FIXED: Proper margins and width constraints */}
      <div 
        className={`transition-all duration-200 overflow-x-hidden ${
          isSidebarCollapsed ? 'ml-0' : 'ml-64'
        }`}
      >
        {/* FIXED: Add proper margins when sidebar is open */}
        <div className={`w-full py-3 transition-all duration-200 ${
          isSidebarCollapsed 
            ? 'px-3' // When collapsed: small margins on both sides
            : 'px-6 mr-6' // When open: larger left padding, right margin for breathing room
        }`}>
          <div className="w-full max-w-none overflow-hidden">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}