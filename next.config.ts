import type { NextConfig } from "next";

// Redirect / to /workflows
const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/workflows",
        permanent: false,
      },
    ]
  }
};

export default nextConfig;
