import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Convex file storage (product images uploaded via the admin panel)
        // — covers both the dev and prod deployments.
        protocol: 'https',
        hostname: '*.convex.cloud',
      },
    ],
  },
};

export default nextConfig;
