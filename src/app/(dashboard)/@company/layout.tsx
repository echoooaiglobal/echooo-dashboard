// src/app/(dashboard)/@company/layout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CompanyLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Verify user is a company
    if (user && user.user_type !== 'company') {
      router.push('/unauthorized');
    }
  }, [user, router]);
  
  // Don't render anything if not a company
  if (user?.user_type !== 'company') {
    return null;
  }
  
  // Pass through children
  return <>{children}</>;
}