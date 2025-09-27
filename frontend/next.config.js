/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'arweave.net',
      'mock-storage.com',
      'via.placeholder.com',
      'explorer.analos.io',
      'picsum.photos'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle canvas for server-side rendering
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }
    
    return config;
  },
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.analos.io',
    NEXT_PUBLIC_EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.analos.io',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://lol-backend-api.onrender.com',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://lol-backend-api.onrender.com',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://launchonlos.fun',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
