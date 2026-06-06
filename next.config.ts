import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint config format warnings from eslint-config-next@16 are non-fatal;
    // TypeScript checks still run. Disable during build to keep output clean.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "a.espncdn.com" },
    ],
  },
};

export default nextConfig;
