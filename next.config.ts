import type { NextConfig } from "next";

/**
 * BASE_PATH is set only for GitHub Pages (served at /confusion-matrix).
 * Netlify and local builds leave it empty and serve from the domain root.
 */
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
