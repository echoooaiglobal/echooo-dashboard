// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Removes console.log in production
  },
  // ADDED: Image configuration for external domains
  images: {
    remotePatterns: [
      // Google OAuth profile images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // GitHub profile images (for future GitHub OAuth)
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Facebook profile images (for future Facebook OAuth)
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        port: '',
        pathname: '/**',
      },
      // LinkedIn profile images (for future LinkedIn OAuth)
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/**',
      },
      // Instagram profile images (for future Instagram OAuth)
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
        port: '',
        pathname: '/**',
      },
      // Twitter profile images (for future Twitter OAuth)
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      // Cloudinary (common image hosting service)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // AWS S3 (common for user uploads)
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      }
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Optional: Add these for better production error handling
  staticPageGenerationTimeout: 300,
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  productionBrowserSourceMaps: false, // Disable source maps in production
};

export default nextConfig;