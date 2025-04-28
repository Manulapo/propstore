import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["loremflickr.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // Uploadthing CDN
        port: "",
      },
    ],
  },
};

export default nextConfig;
