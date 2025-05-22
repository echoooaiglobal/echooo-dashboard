// src/app/(dashboard)/@platform/dashboard/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { PlatformDashboard } from '@/components/dashboard';

export default function PlatformDashboardPage() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Admin Dashboard</h1>
      <p>Welcome, {user?.full_name}</p>
      
      {/* Your actual platform dashboard component */}
      <PlatformDashboard />
    </div>
  );
}