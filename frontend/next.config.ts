import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  // Fix the workspace root issue
  outputFileTracingRoot: require('path').join(__dirname),
  // Skip ESLint during build (root workspace eslint conflicts with frontend)
  eslint: { ignoreDuringBuilds: true },
  // Proxy API calls to backend — eliminates CORS issues entirely
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://maxystyles.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
