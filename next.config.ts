import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 default)
  turbopack: {},
  // Allow large file uploads via server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Image optimization
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
