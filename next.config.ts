import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow server-side file system access
  serverExternalPackages: ["fs", "path", "child_process"],
  
  // Ensure API routes can access filesystem
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
