// src/app/(dashboard)/@company/settings/layout.tsx - FIXED FULL WIDTH
'use client';

import { useAuth } from '@/context/AuthContext';
import RouteGuard from '@/components/auth/RouteGuard';
import { CompanyRole } from '@/types/auth';

const ALLOWED_COMPANY_ROLES: CompanyRole[] = [
  'b2c_company_owner',
  'b2c_company_admin',
  'b2c_marketing_director',
  'b2c_campaign_manager',
  'b2c_campaign_executive',
  'b2c_social_media_manager',
  'b2c_content_creator',
  'b2c_brand_manager',
  'b2c_performance_analyst',
  'b2c_finance_manager',
  'b2c_account_coordinator',
  'b2c_viewer'
];

export default function CompanySettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={ALLOWED_COMPANY_ROLES}>
      {/* Full width container - no max-width restrictions */}
      <div className="w-full">
        {children}
      </div>
    </RouteGuard>
  );
}