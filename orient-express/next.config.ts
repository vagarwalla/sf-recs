import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (it currently lives nested inside
  // another repo with its own lockfile). Safe to keep once extracted.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
