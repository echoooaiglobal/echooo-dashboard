// src/app/(dashboard)/(platform)/layout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Verify user is a platform admin
    if (user && user.user_type !== 'platform') {
      router.push('/unauthorized');
    }
  }, [user, router]);
  
  // Don't render anything if not a platform admin
  if (user?.user_type !== 'platform') {
    return null;
  }
  
  // Pass through children - no UI changes here to preserve your existing components
  return <>{children}</>;
}