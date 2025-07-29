// src/app/(dashboard)/@platform/dashboard/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { withRoleAccess } from '@/components/auth/withRoleAccess';
import PlatformAgentDashboard from '@/components/dashboard/platform/PlatformAgentDashboard';
import PlatformAdminDashboard from '@/components/dashboard/platform/PlatformDashboard';
// import PlatformManagerDashboard from '@/components/dashboard/platform/PlatformManagerDashboard';

// Create role-specific protected components
const AgentDashboard = withRoleAccess(PlatformAgentDashboard, {
  allowedRoles: ['platform_agent'],
  requiredPermissions: [{ resource: 'assigned_influencer', action: 'read' }]
});

const AdminDashboard = withRoleAccess(PlatformAdminDashboard, {
  allowedRoles: ['platform_super_admin', 'platform_admin'],
  requiredPermissions: [{ resource: 'user', action: 'read' }]
});

// const ManagerDashboard = withRoleAccess(PlatformManagerDashboard, {
//   allowedRoles: ['platform_manager', 'platform_operations_manager'],
//   requiredPermissions: [{ resource: 'system', action: 'monitor' }]
// });

export default function PlatformDashboardPage() {
  const { getPrimaryRole } = useAuth();
  const primaryRole = getPrimaryRole();
  
  // Simple role-based routing (only for dashboard level)
  switch (primaryRole) {
    case 'platform_agent':
      return <AgentDashboard />;
    case 'platform_super_admin':
      return <AdminDashboard />;
    case 'platform_admin':
      return <AdminDashboard />;
    case 'platform_manager':
    case 'platform_operations_manager':
      // return <ManagerDashboard />;
    default:
      return <div>Unauthorized Access</div>;
  }
}