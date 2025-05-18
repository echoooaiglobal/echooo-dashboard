// src/app/(dashboard)/dashboard/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dashboard layout content with conditional sidebar based on user type
function DashboardLayoutContent({ children }: { children: ReactNode }) {

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main content area */}
      <div className="flex-1 flex flex-col pt-0">        
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