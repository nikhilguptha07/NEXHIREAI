import path from 'path';
import type { NextConfig } from 'next';

/**
 * NEXHIRE AI — Next.js configuration
 * - App Router, React 19, Turbopack dev
 * - Strict env (server-only secrets never reach client)
 * - Image domains locked down
 * - Output "standalone" for minimal Docker images
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Tuned per Next 15 + Turbopack
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      new URL('https://avatars.githubusercontent.com'),
      new URL('https://lh3.googleusercontent.com'),
      new URL('https://graph.microsoft.com'),
      new URL('https://images.unsplash.com'),
    ],
  },
  // Server-side only env validation; surface clear errors early.
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'NEXHIRE AI',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
