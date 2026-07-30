import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      }
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
    qualities: [25, 50, 70, 75, 80, 90, 100],
  },
  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
        ],
      },
      {
        source: '/:path*\\.(avif|webp|png|jpg|jpeg|svg|gif)',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
