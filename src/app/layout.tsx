// /src/app/layout.tsx
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { LocationCacheProvider } from '@/context/LocationCacheContext';
import Navbar from '@/components/Navbar';
import InfluencerDetails from '../components/InfluencerDetails/InfluencerDetails';
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


const data = {
  stats: [
    {
      title: 'Followers',
      value: '688M',
      change: '▲ 0.03% this month',
      chartData: { labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr'], data: [682, 684, 686, 688, 688] }
    },
    {
      title: 'Following',
      value: '150',
      change: '▲ 2.63% this month',
      chartData: { labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr'], data: [120, 130, 140, 150, 150] }
    },
    {
      title: 'Likes',
      value: '250k',
      change: '▼ 5.8% this month',
      chartData: { labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr'], data: [100, 150, 200, 250, 250] }
    },
  ],
  engagementRate: 0.04,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} key="layout-body">
        <LocationCacheProvider>
          <Navbar />
          <main className="container mx-auto p-4">{children}</main>
        </LocationCacheProvider>

        <div>
      <InfluencerDetails stats={data.stats} engagementRate={data.engagementRate} />
    </div>

      </body>
    </html>
  );
}