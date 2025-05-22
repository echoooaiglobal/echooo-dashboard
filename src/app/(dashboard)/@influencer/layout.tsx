// src/app/(dashboard)/(influencer)/layout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function InfluencerLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Verify user is an influencer
    if (user && user.user_type !== 'influencer') {
      router.push('/unauthorized');
    }
  }, [user, router]);
  
  // Don't render anything if not an influencer
  if (user?.user_type !== 'influencer') {
    return null;
  }
  
  // Pass through children - no UI changes here to preserve your existing components
  return <>{children}</>;
}