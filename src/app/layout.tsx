import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Link from 'next/link';
import { LocationCacheProvider } from '@/context/LocationCacheContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} key="layout-body">
        <LocationCacheProvider>
          <nav className="bg-gray-800 p-4">
            <div className="container mx-auto">
              <Link href="/">
                <h1 className="text-white text-2xl">Echooo</h1>
              </Link>
            </div>
          </nav>
          <main className="container mx-auto p-4">{children}</main>
        </LocationCacheProvider>
      </body>
    </html>
  );
}