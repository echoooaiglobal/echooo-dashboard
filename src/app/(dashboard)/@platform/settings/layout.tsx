// src/app/(dashboard)/@platform/settings/layout.tsx - FIXED FULL WIDTH
'use client';

import { useAuth } from '@/context/AuthContext';
import RouteGuard from '@/components/auth/RouteGuard';
import { PlatformRole } from '@/types/auth';

const ALLOWED_PLATFORM_ROLES: PlatformRole[] = [
  'platform_super_admin',
  'platform_admin',
  'platform_manager',
  'platform_developer',
  'platform_customer_support',
  'platform_account_manager',
  'platform_financial_manager',
  'platform_content_moderator',
  'platform_data_analyst',
  'platform_operations_manager',
  'platform_agent'
];

export default function PlatformSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={ALLOWED_PLATFORM_ROLES}>
      {/* Full width container - no max-width restrictions */}
      <div className="w-full">
        {children}
      </div>
    </RouteGuard>
  );
}