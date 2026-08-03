import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/mansoorsaqib/Desktop/Provit",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "btjlxjwrymhbvvmjuazk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
};

export default nextConfig;
