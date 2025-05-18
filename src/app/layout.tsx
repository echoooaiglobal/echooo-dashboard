// src/app/layout.tsx
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { LocationCacheProvider } from '@/context/LocationCacheContext';
import { AuthProvider } from '@/context/AuthContext';
import { CampaignProvider } from '@/context/CampaignContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/navbar';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Echooo - Influencer Platform',
  description: 'Manage influencer campaigns with Echooo',
  icons: {
    icon: [
      { url: '/favicons/echooo-favicon.png' },
      { url: '/favicons/echooo-favicon.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/echooo-favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} key="layout-body">
        <AuthProvider>
          <CampaignProvider>
            <LocationCacheProvider>
              <Navbar />
              <main className="w-full">{children}</main>
            </LocationCacheProvider>
          </CampaignProvider>
        </AuthProvider>
      </body>
    </html>
  );
}