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
  // Optional: Add these for better production error handling
  staticPageGenerationTimeout: 300,
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  productionBrowserSourceMaps: false, // Disable source maps in production
};

export default nextConfig;