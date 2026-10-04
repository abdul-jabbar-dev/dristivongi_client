import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edvznvhxoaqflmxembnl.storage.supabase.co', // Leave for backward compatibility if any
      },
      {
        protocol: 'https',
        hostname: 'edvznvhxoaqflmxembnl.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
};

export default nextConfig;
