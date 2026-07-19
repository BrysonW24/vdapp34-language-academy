const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
  },
  redirects: async () => [
    {
      source: '/words/:path*',
      destination: '/es/words/:path*',
      permanent: true,
    },
    {
      source: '/topics/:path*',
      destination: '/es/topics/:path*',
      permanent: true,
    },
    {
      source: '/grammar/:path*',
      destination: '/es/grammar/:path*',
      permanent: true,
    },
    {
      source: '/phrases/:path*',
      destination: '/es/phrases/:path*',
      permanent: true,
    },
    {
      source: '/practice/:path*',
      destination: '/es/practice/:path*',
      permanent: true,
    },
    {
      source: '/timeline/:path*',
      destination: '/es/timeline/:path*',
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
}

module.exports = nextConfig
