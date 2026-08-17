import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "www.taxcomppro.com" },
      { protocol: "https", hostname: "taxcomppro.com" },
    ],
  },
};

export default nextConfig;
