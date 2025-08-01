// ============================================
// 1. src/app/(dashboard)/settings/layout.tsx
// ============================================
'use client';

import { useAuth } from '@/context/AuthContext';
import SettingsNavigation from '@/components/settings/layout/SettingsNavigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SettingsNavigation />
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}