// src/app/profile-analytics-report/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile Analytics Report | Public View',
  description: 'Public view of comprehensive profile analytics report including audience insights, content performance, and collaboration pricing.',
  keywords: 'profile analytics, influencer marketing, audience insights, engagement metrics, social media analytics',
  openGraph: {
    title: 'Profile Analytics Report',
    description: 'Comprehensive profile analytics including audience demographics, content performance, and market insights.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profile Analytics Report',
    description: 'Comprehensive profile analytics including audience demographics, content performance, and market insights.',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function PublicReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}