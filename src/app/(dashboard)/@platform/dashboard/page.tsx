// src/app/(dashboard)/@platform/dashboard/page.tsx - Enhanced with role-based routing
'use client';

import { useAuth } from '@/context/AuthContext';
import { PlatformDashboard } from '@/components/dashboard';
import PlatformAgentDashboard from '@/components/dashboard/platform/PlatformAgentDashboard';

export default function PlatformDashboardPage() {
  const { user, getPrimaryRole } = useAuth();
  const primaryRole = getPrimaryRole();
  
  // Route to appropriate dashboard based on specific platform role
  switch (primaryRole) {
    case 'platform_agent':
      return <PlatformAgentDashboard />;
      
    case 'platform_admin':
    case 'platform_manager':
    case 'platform_user':
    case 'platform_accountant':
    case 'platform_developer':
    case 'platform_customer_support':
    case 'platform_content_moderator':
    default:
      return (
        <div>
          <h1 className="text-2xl font-bold mb-6">
            {primaryRole === 'platform_admin' ? 'Platform Admin Dashboard' : 
             primaryRole === 'platform_manager' ? 'Platform Manager Dashboard' :
             'Platform Dashboard'}
          </h1>
          <p>Welcome, {user?.full_name}</p>
          
          {/* Your actual platform dashboard component */}
          <PlatformDashboard />
        </div>
      );
  }
}