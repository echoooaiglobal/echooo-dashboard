// src/app/(dashboard)/dashboard/layout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
// import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { isUserType } from '@/utils/user-helpers';
import { UserType } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Dashboard layout content with conditional sidebar based on user type
function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [userType, setUserType] = useState<UserType>('influencer'); // Default

  useEffect(() => {
    if (user?.user_type) {
      setUserType(user.user_type);
    }
  }, [user]);

  // Display placeholder color indicator during development (can be removed in production)
  const getTypeIndicatorColor = () => {
    if (isUserType(user, 'platform')) return 'bg-indigo-600';
    if (isUserType(user, 'company')) return 'bg-blue-600';
    return 'bg-purple-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {/* <DashboardSidebar userType={userType} /> */}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col pt-16">
        {/* Optional: User type indicator (for development purposes) */}
        <div className={`h-1 w-full ${getTypeIndicatorColor()}`}></div>
        
        {/* Page content with container for proper spacing */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 text-center">© {new Date().getFullYear()} Echooo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Protected Dashboard Layout
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}