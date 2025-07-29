// src/app/(dashboard)/@influencer/settings/layout.tsx - FIXED FULL WIDTH
'use client';

import { useAuth } from '@/context/AuthContext';
import RouteGuard from '@/components/auth/RouteGuard';
import { InfluencerRole } from '@/types/auth';

const ALLOWED_INFLUENCER_ROLES: InfluencerRole[] = [
  'influencer',
  'influencer_manager'
];

export default function InfluencerSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={ALLOWED_INFLUENCER_ROLES}>
      {/* Full width container - no max-width restrictions */}
      <div className="w-full">
        {children}
      </div>
    </RouteGuard>
  );
}